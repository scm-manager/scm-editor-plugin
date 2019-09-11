// @flow
import React from "react";
import {translate} from "react-i18next";
import injectSheet from "react-jss";
import type {File, Me, Repository} from "@scm-manager/ui-types";
import {withRouter} from "react-router-dom";
import Subtitle from "@scm-manager/ui-components/src/layout/Subtitle";
import FilePath from "../FilePath";
import {
  apiClient,
  Button,
  ButtonGroup,
  ErrorNotification,
  InputField,
  Loading,
  Textarea
} from "@scm-manager/ui-components";
import queryString from "query-string";
import {compose} from "redux";
import {connect} from "react-redux";
import classNames from "classnames";
import CommitMessage from "../CommitMessage";
import {isEditable} from "./isEditable";

const styles = {
  editor: {
    marginBottom: "2rem",
    "& div": {
      "& div": {
        "& textarea": {
          fontFamily: "courier",
          "&:not([rows])": {
            minHeight: "30rem",
            maxHeight: "100rem"
          }
        }
      }
    }
  },
  branch: {
    "& input": {
      marginBottom: "2rem"
    }
  }
};

type Props = {
  repository: Repository,
  me: Me,
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
      file: null,
      path: ""
    };
  }

  componentDidMount() {
    this.fetchFile();
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
        response.text().then(content =>
          this.setState({
              contentType: response.headers.get("Content-Type"),
              language: response.headers.get("X-Programming-Language"),
              content
            }, this.afterLoading))
      .catch(this.handleInitialError);
      })
      .catch(this.handleInitialError);
  };

  afterLoading = () => {
    const {file, initialLoading, path, pathWithFilename} = this.state;
    const parentDirPath = pathWithFilename.replace(file.name, "");

    !path && this.setState({path: parentDirPath});
    initialLoading && this.setState({initialLoading: false});
  };

  createFileUrl = () => new Promise((resolve, reject) => {
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

      const pathDefined = pathWithFilename ? pathWithFilename : "";
      resolve(`${base}${encodeURIComponent(revision)}/${pathDefined}`);
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
  handleError = error => {
    this.setState({initialLoading: false, error});
  };

  redirectToContentView = () => {
    //TODO Redirect using the explicit file url
    this.props.history.goBack();
  };

  commitFile = () => {
    const {repository} = this.props;
    const {file, commitMessage, path, revision, content} = this.state;

    if (file) {
      const link = repository._links.modify.href;
      const blob = new Blob([content], {type: file.type});
      this.setState({loading: true});

      apiClient
        .postBinary(
          link.replace("{path}", path) +
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
    const {t, classes, me} = this.props;
    const {
      path,
      file,
      content,
      initialLoading,
      initialError,
      loading,
      revision,
      error,
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

    if (!isEditable(contentType, language)) {
      return <ErrorNotification error={{message: t("scm-editor-plugin.edit.notEditable")}} />;
    }

    return (
      <>
        <Subtitle subtitle={t("scm-editor-plugin.edit.subtitle")}/>
        <div className={classes.branch}>
          <InputField
            label={t("scm-editor-plugin.edit.selectedBranch")}
            className={classNames("is-fullwidth")}
            disabled={true}
            value={revision}
          />
        </div>
        <FilePath
          changePath={this.changePath}
          path={path}
          file={file}
          changeFileName={this.changeFileName}
          disabled={file || loading}
        />
        <div className={classes.editor}>
          <Textarea
            value={content && content}
            onChange={this.changeFileContent}
            disabled={loading}
          />
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
                disabled={!commitMessage || !content}
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
