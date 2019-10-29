import React from "react";
import {WithTranslation, withTranslation} from "react-i18next";
import {File, Me, Repository} from "@scm-manager/ui-types";
import {RouteComponentProps, withRouter} from "react-router-dom";
import FilePath from "../FileMetaData";
import {apiClient, Button, ButtonGroup, ErrorNotification, Loading, Subtitle} from "@scm-manager/ui-components";
import queryString from "query-string";
import {compose} from "redux";
import {connect} from "react-redux";
import CommitMessage from "../CommitMessage";
import {isEditable} from "./isEditable";
import styled from "styled-components";
import Editor from "../Editor";
import findLanguage from "../findLanguage";
import {getSources} from "./fileEdit";

const Branch = styled.div`
  margin-bottom: 1rem;
`;

const Border = styled.div`
  margin-bottom: 2rem;
  border: 1px solid #98d8f3;
  border-radius: 4px;
  & .input:focus,
  .input:active,
  .textarea:focus,
  .textarea:active {
    box-shadow: none;
  }
  ,
    &:focus-within: {
    border-color: #33b2e8;
    box-shadow: 0 0 0 0.125em rgba(51, 178, 232, 0.25);
    &:hover {
      border-color: #33b2e8;
    }
  }
  ,
    &:hover: {
    border: 1px solid #b5b5b5;
    border-radius: 4px;
  }
  ,
    & .input, .textarea: {
    border-color: #dbdbdb;
  }
`;

type Props = WithTranslation &
  RouteComponentProps & {
    repository: Repository;
    me: Me;
    editMode: boolean;
    file: File;
    sources: File;
  };

type State = {
  file: File;
  content: string;
  pathWithFilename: string;
  path: string;
  revision: string;
  initialError: Error;
  initialLoading: boolean;
  error: Error;
  loading: boolean;
  commitMessage: string;
  contentType: string;
  language: string;
  contentLength: number;
};

class FileEdit extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      initialLoading: true,
      loading: false,
      pathWithFilename: this.props.match.params.path,
      revision: queryString.parse(this.props.location.search, {
        ignoreQueryPrefix: true
      }).branch,
      file: this.props.editMode ? null : {},
      path: "",
      isValid: true
    };
  }

  componentDidMount() {
    if (this.props.editMode) {
      this.fetchFile();
    } else {
      this.setState({
        initialLoading: false
      });
      this.afterLoading();
    }
  }

  fetchFile = () => {
    this.createFileUrl()
      .then(apiClient.get)
      .then(response => response.json())
      .then(file =>
        this.setState({
          file
        })
      )
      .then(() => this.fetchContent())
      .catch(this.handleInitialError);
  };

  fetchContent = () => {
    apiClient
      .get(this.state.file._links.self.href)
      .then(response => {
        response
          .text()
          .then(content =>
            this.setState(
              {
                contentType: response.headers.get("Content-Type"),
                language: response.headers.get("X-Programming-Language"),
                contentLength: content.length,
                content
              },
              this.afterLoading
            )
          )
          .catch(this.handleInitialError);
      })
      .catch(this.handleInitialError);
  };

  afterLoading = () => {
    const { file, initialLoading, path, pathWithFilename } = this.state;
    const parentDirPath = this.props.editMode ? pathWithFilename.replace(file.name, "") : pathWithFilename;

    !path &&
      this.setState({
        path: parentDirPath
      });
    initialLoading &&
      this.setState({
        initialLoading: false
      });
  };

  createFileUrl = () =>
    new Promise((resolve, reject) => {
      const { repository, t } = this.props;
      const { revision, pathWithFilename } = this.state;

      if (repository._links.sources) {
        const base = repository._links.sources.href;

        if (!pathWithFilename) {
          reject(new Error(t("scm-editor-plugin.errors.fileMissing")));
        }

        if (!revision) {
          reject(new Error(t("scm-editor-plugin.errors.branchMissing")));
        }

        const encodedRevision = encodeURIComponent(revision);

        const pathDefined = pathWithFilename ? pathWithFilename : "";
        resolve(`${base}${encodedRevision}/${pathDefined}`);
      }
    });

  changePath = path => {
    this.setState({
      path
    });
  };

  changeFileName = fileName => {
    const { file } = this.state;
    this.setState({
      file: {
        ...file,
        name: fileName
      }
    });
  };

  changeFileContent = content => {
    this.setState({
      content
    });
  };

  changeCommitMessage = commitMessage => {
    this.setState({
      commitMessage
    });
  };
  handleInitialError = initialError => {
    this.setState({
      initialLoading: false,
      initialError
    });
  };
  validate = isValid => {
    this.setState({
      isValid
    });
  };

  handleError = error => {
    this.setState({
      loading: false,
      initialLoading: false,
      error
    });
  };

  redirectToContentView = newCommit => {
    const { repository } = this.props;
    const { path, file } = this.state;

    const pathWithEndingSlash = !path ? "" : path.endsWith("/") ? path : path + "/";
    const encodedFilename = file && file.name ? encodeURIComponent(this.state.file.name) + "/" : "";

    let redirectUrl = `/repo/${repository.namespace}/${repository.name}/sources`;
    if (newCommit) {
      const newRevision =
        newCommit._embedded &&
        newCommit._embedded.branches &&
        newCommit._embedded.branches[0] &&
        newCommit._embedded.branches[0].name
          ? newCommit._embedded.branches[0].name
          : newCommit.id;
      redirectUrl += `/${newRevision}/${pathWithEndingSlash + encodedFilename}`;
    }

    this.props.history.push(redirectUrl);
  };

  commitFile = () => {
    const { editMode, sources } = this.props;
    const { file, commitMessage, path, revision, content } = this.state;

    if (file) {
      const link = editMode ? sources._links.modify.href : sources._links.fileUpload.href;
      const blob = new Blob([content ? content : ""], {
        type: editMode ? file.type : "text/plain"
      });
      this.setState({
        loading: true
      });

      const commit = {
        commitMessage,
        branch: revision,
        names: {
          file: file.name
        }
      };
      apiClient
        .postBinary(link.replace("{path}", path ? path : "") + (revision ? "?branch=" + revision : ""), formdata => {
          formdata.append("file", blob, "file");
          formdata.append("commit", JSON.stringify(commit));
        })
        .then(r => r.json())
        .then(newCommit => this.redirectToContentView(newCommit))
        .catch(this.handleError);
    }
  };

  changeLanguage = (language: string) => {
    this.setState({
      language
    });
  };

  render() {
    const { t, me, editMode } = this.props;
    const {
      path,
      file,
      content,
      initialLoading,
      initialError,
      loading,
      error,
      isValid,
      revision,
      commitMessage,
      contentType,
      contentLength
    } = this.state;

    if (initialLoading) {
      return <Loading />;
    }

    if (initialError) {
      return <ErrorNotification error={initialError} />;
    }

    const language = findLanguage(this.state.language);
    if (editMode && !isEditable(contentType, language, contentLength)) {
      return (
        <ErrorNotification
          error={{
            message: t("scm-editor-plugin.edit.notEditable")
          }}
        />
      );
    }

    return (
      <>
        <Subtitle subtitle={t("scm-editor-plugin.edit.subtitle")} />
        {revision && (
          <Branch>
            <span>
              <strong>{t("scm-editor-plugin.edit.selectedBranch") + ": "}</strong>
              {revision}
            </span>
          </Branch>
        )}
        <Border>
          <FilePath
            changePath={this.changePath}
            path={path}
            file={file}
            changeFileName={this.changeFileName}
            disabled={editMode || loading}
            validate={this.validate}
            language={language}
            changeLanguage={this.changeLanguage}
          />
          <Editor onChange={this.changeFileContent} content={content} disabled={loading} language={language} />
        </Border>
        <CommitMessage me={me} commitMessage={commitMessage} onChange={this.changeCommitMessage} disabled={loading} />
        {error && <ErrorNotification error={error} />}
        <div className="level">
          <div className="level-left" />
          <div className="level-right">
            <ButtonGroup>
              <Button
                label={t("scm-editor-plugin.button.cancel")}
                disabled={loading}
                action={() => this.redirectToContentView(this.state.revision)}
              />
              <Button
                label={t("scm-editor-plugin.button.commit")}
                color={"primary"}
                disabled={!commitMessage || !isValid || !file.name}
                action={this.commitFile}
                loading={loading}
              />
            </ButtonGroup>
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { repository } = ownProps;
  const { auth } = state;
  const me = auth.me;
  const sources = getSources(state, repository, "", "");

  return {
    me,
    sources
  };
};

export default compose(
  withRouter,
  connect(mapStateToProps),
  withTranslation("plugins")
)(FileEdit);
