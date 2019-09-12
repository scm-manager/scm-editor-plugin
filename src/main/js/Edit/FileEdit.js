// @flow
import React from "react";
import {translate} from "react-i18next";
import injectSheet from "react-jss";
import type {File, Me, Repository} from "@scm-manager/ui-types";
import {withRouter} from "react-router-dom";
import Subtitle from "@scm-manager/ui-components/src/layout/Subtitle";
import FilePath from "../FilePath";
import {apiClient, Button, ButtonGroup, ErrorNotification, Loading, Textarea} from "@scm-manager/ui-components";
import queryString from "query-string";
import {compose} from "redux";
import {connect} from "react-redux";
import CommitMessage from "../CommitMessage";
import {isEditable} from "./isEditable";

const styles = {
  editor: {
    "& div": {
      "& div": {
        "& textarea": {
          fontFamily: "monospace",
          "&:not([rows])": {
            minHeight: "30rem",
            maxHeight: "100rem",
            border: "none",
            borderRadius: "4px"
          },
          "&:hover": {
            border: "none"
          }
        }
      }
    }
  },
  branch: {
    marginBottom: "1rem"
  },
  border: {
    marginBottom: "2rem",
    border: "1px solid #98d8f3",
    borderRadius: "4px",
    "& .input:focus, .input:active, .textarea:focus, .textarea:active": {
      boxShadow: "none"
    },
    "&:focus-within": {
      borderColor: "#33b2e8",
      boxShadow: "0 0 0 0.125em rgba(51, 178, 232, 0.25)",
      "&:hover": {
        borderColor: "#33b2e8"
      }
    },
    "&:hover": {
      border: "1px solid #b5b5b5",
      borderRadius: "4px"
    },
    "& .input, .textarea": {
      borderColor: "#dbdbdb"
    }
  }
};

type Props = {
  repository: Repository,
  me: Me,
  editMode: boolean,
  file: File,

  //context props
  t: string => string,
  match: any,
  location: any,
  classes: any
};

type State = {
  file: File,
  content: string,
  pathWithFilename: string,
  path: string,
  revision: string,
  initialError: Error,
  initialLoading: boolean,
  error: Error,
  loading: boolean,
  commitMessage: string,
  contentType: string,
  language: string
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
      this.setState({initialLoading: false});
      this.afterLoading();
    }
  }

  fetchFile = () => {
    this.createFileUrl()
      .then(apiClient.get)
      .then(response => response.json())
      .then(file => this.setState({file}))
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
    const {file, initialLoading, path, pathWithFilename} = this.state;
    const parentDirPath = this.props.editMode
      ? pathWithFilename.replace(file.name, "")
      : pathWithFilename;

    !path && this.setState({path: parentDirPath});
    initialLoading && this.setState({initialLoading: false});
  };

  createFileUrl = () =>
    new Promise((resolve, reject) => {
      const {repository, t} = this.props;
      const {revision, pathWithFilename} = this.state;

      if (repository._links.sources) {
        let base = repository._links.sources.href;

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
    this.setState({path});
  };

  changeFileName = fileName => {
    const {file} = this.state;
    this.setState({file: {...file, name: fileName}});
  };

  changeFileContent = content => {
    this.setState({content});
  };

  changeCommitMessage = commitMessage => {
    this.setState({commitMessage});
  };
  handleInitialError = initialError => {
    this.setState({initialLoading: false, initialError});
  };
  validate = isValid => {
    this.setState({isValid});
  };

  handleError = error => {
    this.setState({initialLoading: false, error});
  };

  redirectToContentView = () => {
    const {repository} = this.props;
    const {revision, path, file} = this.state;

    const pathWithEndingSlash = !path
      ? ""
      : path.endsWith("/")
        ? path
        : path + "/";
    const encodedRevision = encodeURIComponent(revision);
    const encodedFilename =
      file && file.name ? encodeURIComponent(this.state.file.name) + "/" : "";

    const redirectUrl = `/repo/${repository.namespace}/${
      repository.name
    }/sources/${encodedRevision}/${pathWithEndingSlash + encodedFilename}`;

    this.props.history.push(redirectUrl);
  };

  commitFile = () => {
    const {repository, editMode} = this.props;
    const {file, commitMessage, path, revision, content} = this.state;

    if (file) {
      const link = editMode
        ? repository._links.modify.href
        : repository._links.fileUpload.href;
      const blob = new Blob([content], {
        type: editMode ? file.type : "text/plain"
      });
      this.setState({loading: true});

      apiClient
        .postBinary(
          link.replace("{path}", path ? path : "") +
          (revision ? "?branch=" + revision : ""),
          formdata => {
            formdata.append("file", blob, file.name);
            formdata.append(
              "commit",
              JSON.stringify({commitMessage, branch: revision})
            );
          }
        )
        .then(this.redirectToContentView)
        .catch(this.handleError);
    }
  };

  render() {
    const {t, classes, me, editMode} = this.props;
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
      language
    } = this.state;

    if (initialLoading) {
      return <Loading/>;
    }

    if (initialError) {
      return <ErrorNotification error={initialError}/>;
    }

    if (editMode && !isEditable(contentType, language)) {
      return (
        <ErrorNotification
          error={{message: t("scm-editor-plugin.edit.notEditable")}}
        />
      );
    }

    return (
      <>
        <Subtitle subtitle={t("scm-editor-plugin.edit.subtitle")}/>
        {revision && (
          <div className={classes.branch}>
            <span>
              <strong>
                {t("scm-editor-plugin.edit.selectedBranch") + ": "}
              </strong>
              {revision}
            </span>
          </div>
        )}
        <div className={classes.border}>
          <FilePath
            changePath={this.changePath}
            path={path}
            file={file}
            changeFileName={this.changeFileName}
            disabled={editMode || loading}
            validate={this.validate}
          />
          <div className={classes.editor}>
            <Textarea
              value={content && content}
              onChange={this.changeFileContent}
              disabled={loading}
              placeholder={t("scm-editor-plugin.edit.placeholder")}
            />
          </div>
        </div>
        <CommitMessage
          me={me}
          commitMessage={commitMessage}
          onChange={this.changeCommitMessage}
          disabled={loading}
        />
        {error && <ErrorNotification error={error}/>}
        <div className="level">
          <div className="level-left"/>
          <div className="level-right">
            <ButtonGroup>
              <Button
                label={t("scm-editor-plugin.button.cancel")}
                disabled={loading}
                action={this.redirectToContentView}
              />
              <Button
                label={t("scm-editor-plugin.button.commit")}
                color={"primary"}
                disabled={!commitMessage || !content || !isValid || !file.name}
                action={() => this.commitFile()}
                loading={loading}
              />
            </ButtonGroup>
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = state => {
  const {auth} = state;
  const me = auth.me;

  return {
    me
  };
};

export default compose(
  injectSheet(styles),
  withRouter,
  connect(mapStateToProps),
  translate("plugins")
)(FileEdit);
