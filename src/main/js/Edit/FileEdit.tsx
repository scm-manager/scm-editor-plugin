import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { Changeset, File, Link, Me, Repository } from "@scm-manager/ui-types";
import { RouteComponentProps, withRouter } from "react-router-dom";
import FileMetaData from "../FileMetaData";
import {
  apiClient,
  Button,
  ButtonGroup,
  ErrorNotification,
  Loading,
  Notification,
  Subtitle
} from "@scm-manager/ui-components";
import { compose } from "redux";
import { connect } from "react-redux";
import CommitMessage from "../CommitMessage";
import { isEditable } from "./isEditable";
import styled from "styled-components";
import Editor from "../Editor";
import findLanguage from "../findLanguage";

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

type FileWithType = File & {
  type?: string;
};

type Props = WithTranslation &
  RouteComponentProps & {
    repository: Repository;
    me: Me;
    extension: string;
    revision?: string;
    path?: string;
    file: FileWithType;
    sources: File;
  };

type State = {
  file?: FileWithType;
  content: string;
  path: string;
  initialError: Error;
  initialLoading: boolean;
  error: Error;
  loading: boolean;
  commitMessage?: string;
  contentType: string;
  language: string;
  contentLength: number;
  isValid?: boolean;
};

class FileEdit extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      initialLoading: true,
      loading: false,
      path: "",
      file: this.isEditMode() ? null : {},
      isValid: true
    };
  }

  componentDidMount() {
    if (this.isEditMode()) {
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
      .then((file: FileWithType) =>
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
    const pathWithFilename = this.props.path;
    const { file, initialLoading, path } = this.state;
    const parentDirPath = this.isEditMode() ? pathWithFilename.replace(file.name, "") : pathWithFilename;

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
      const { repository, revision, path, t } = this.props;
      if (repository._links.sources) {
        const base = (repository._links.sources as Link).href;

        if (!path) {
          reject(new Error(t("scm-editor-plugin.errors.fileMissing")));
        }

        if (!revision) {
          reject(new Error(t("scm-editor-plugin.errors.branchMissing")));
        }

        const encodedRevision = revision ? encodeURIComponent(revision) : "";

        const pathDefined = path || "";
        resolve(`${base}${encodedRevision}/${pathDefined}`);
      }
    });

  isEditMode = () => {
    const { extension, path } = this.props;
    return extension === "edit" && path;
  };

  changePath = (path: string) => {
    this.setState({
      path
    });
  };

  changeFileName = (fileName: string) => {
    this.setState((state: State) => {
      return {
        file: {
          ...state.file,
          name: fileName
        }
      };
    });
  };

  changeFileContent = (content: string) => {
    this.setState({
      content
    });
  };

  changeCommitMessage = (commitMessage: string) => {
    this.setState({
      commitMessage
    });
  };

  handleInitialError = (initialError: Error) => {
    this.setState({
      initialLoading: false,
      initialError
    });
  };

  validate = (isValid: boolean) => {
    this.setState({
      isValid
    });
  };

  handleError = (error: Error) => {
    this.setState({
      loading: false,
      initialLoading: false,
      error
    });
  };

  redirectToContentView = (newCommit: Changeset) => {
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
      redirectUrl += `/${encodeURIComponent(newRevision)}/${pathWithEndingSlash + encodedFilename}`;
    }

    this.props.history.push(redirectUrl);
  };

  commitFile = () => {
    const { sources, revision } = this.props;
    const { file, commitMessage, path, content } = this.state;

    if (file) {
      let link;
      let type;
      if (this.isEditMode()) {
        link = (sources._links.modify as Link).href;
        type = file.type;
      } else {
        link = (sources._links.fileUpload as Link).href;
        link = link.replace("{path}", path ? path : "");
        type = "text/plain";
      }

      const blob = new Blob([content ? content : ""], {
        type
      });
      this.setState({
        loading: true
      });

      const commit = {
        commitMessage,
        branch: decodeURIComponent(revision),
        names: {
          file: file.name
        }
      };

      apiClient
        .postBinary(link, formdata => {
          formdata.append("file", blob, "file");
          formdata.append("commit", JSON.stringify(commit));
        })
        .then((r: Response) => r.json())
        .then((newCommit: Changeset) => this.redirectToContentView(newCommit))
        .catch(this.handleError);
    }
  };

  changeLanguage = (language: string) => {
    this.setState({
      language
    });
  };

  render() {
    const { revision, t, me } = this.props;
    const {
      path,
      file,
      content,
      initialLoading,
      initialError,
      loading,
      error,
      isValid,
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
    if (this.isEditMode() && !isEditable(contentType, language, contentLength)) {
      return <Notification type="danger">{t("scm-editor-plugin.edit.notEditable")}</Notification>;
    }

    return (
      <>
        <Subtitle subtitle={t("scm-editor-plugin.edit.subtitle")} />
        {revision && (
          <Branch>
            <span>
              <strong>{t("scm-editor-plugin.edit.selectedBranch") + ": "}</strong>
              {decodeURIComponent(revision)}
            </span>
          </Branch>
        )}
        <Border>
          <FileMetaData
            changePath={this.changePath}
            path={path}
            file={file}
            changeFileName={this.changeFileName}
            disabled={this.isEditMode() || loading}
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
                action={() => this.redirectToContentView(revision)}
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

const mapStateToProps = (state: any) => {
  const { auth } = state;
  const me = auth.me;

  return {
    me
  };
};

export default compose(
  withRouter,
  connect(mapStateToProps),
  withTranslation("plugins")
)(FileEdit);
