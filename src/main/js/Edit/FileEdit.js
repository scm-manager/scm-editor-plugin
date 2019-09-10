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

const styles = {
  editor: {
    marginBottom: "2rem",
    "& div": {
      "& div": {
        "& textarea": {
          "&:not([rows])": {
            minHeight: "30rem",
            maxHeight: "100rem"
          }
        }
      }
    }
  }
};

type Props = {
  repository: Repository,
  me: Me,

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
  error: Error,
  initialLoading: boolean,
  loading: boolean,
  commitMessage: string
};

class FileEdit extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      initialLoading: false,
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
    apiClient
      .get(this.createFileUrl())
      .then(response => response.json())
      .then(file => this.setState({file}))
      .then(() => this.fetchContent())
      .catch(error => this.setState({error}));
  };

  fetchContent = () => {
    apiClient
      .get(this.state.file._links.self.href)
      .then(response => response.text())
      .then(content => this.setState({content}))
      .then(() => this.afterLoading())
      .catch(error => this.setState({error}));
  };

  afterLoading = () => {
    const {file, initialLoading, path, pathWithFilename} = this.state;
    const parentDirPath = pathWithFilename.replace(file.name, "");

    !path && this.setState({path: parentDirPath});
    initialLoading && this.setState({initialLoading: false});
  };

  createFileUrl = () => {
    const {repository} = this.props;
    const {revision, pathWithFilename} = this.state;

    if (repository._links.sources) {
      let base = repository._links.sources.href;

      if (!revision && !pathWithFilename) {
        return base;
      }

      const pathDefined = pathWithFilename ? pathWithFilename : "";
      return `${base}${encodeURIComponent(revision)}/${pathDefined}`;
    }
  };

  changePath = path => {
    this.setState({path});
  };

  changeFileName = fileName => {
    const {file} = this.state;
    this.setState({...file, file: {name: fileName}});
  };

  changeFileContent = content => {
    this.setState({content});
  };

  changeCommitMessage = commitMessage => {
    this.setState({commitMessage});
  };

  handleError = error => {
    this.setState({error});
  };

  commitFile = () => {
    const {history, repository} = this.props;
    const {file, commitMessage, path, revision, content} = this.state;

    if (file) {
      const link = repository._links.modify.href;
      const blob = new Blob([content], {type: file.type});

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
        .then(() => history.goBack())
        .catch(this.handleError);
    }
    this.setState({loading: true});
  };

  render() {
    const {t, classes, me, location} = this.props;
    const {
      path,
      file,
      content,
      initialLoading,
      loading,
      error,
      commitMessage
    } = this.state;

    if (initialLoading) {
      return <Loading/>;
    }

    return (
      <>
        <Subtitle subtitle={t("scm-editor-plugin.edit.subtitle")}/>
        <FilePath
          changePath={this.changePath}
          path={path}
          file={file}
          changeFileName={this.changeFileName}
        />
        <div className={classes.editor}>
          <Textarea
            value={content && content}
            onChange={this.changeFileContent}
          />
        </div>
        <CommitMessage
          me={me}
          commitMessage={commitMessage}
          onChange={this.changeCommitMessage}
        />
        {error && <ErrorNotification error={error}/>}
        <div className="level">
          <div className="level-left"/>
          <div className="level-right">
            <ButtonGroup>
              <Button
                label={t("scm-editor-plugin.button.cancel")}
                link={location.pathname}
                disabled={loading}
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
