// @flow
import React from "react";
import {translate} from "react-i18next";
import injectSheet from "react-jss";
import type {File, Repository} from "@scm-manager/ui-types";
import {withRouter} from "react-router-dom";
import Subtitle from "@scm-manager/ui-components/src/layout/Subtitle";
import FilePath from "../FilePath";
import {apiClient, Loading, Textarea} from "@scm-manager/ui-components";
import queryString from "query-string";

const styles = {
  editor: {
    minHeight: "20rem"
  }
};

type Props = {
  repository: Repository,

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
  loading: boolean
};

class FileEdit extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: true,
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
  };

  componentDidUpdate() {
    const {file, loading, content} = this.state;

    if (loading && file && content) {
      const {file, loading, path} = this.state;
      const parentDirPath = this.state.pathWithFilename.replace(file.name, "");

      !path && this.setState({path: parentDirPath});
      loading && this.setState({loading: false});
      this.setState({loading: false});
    }
  };

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
      .catch(error => this.setState({error}));
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

  changePath = (path: string) => {
    this.setState({path});
  };

  changeFileName = (fileName: string) => {
    const {file} = this.state;
    this.setState({...file, file: {name: fileName}});
  };

  changeFileContent = content => {
    this.setState({content});
  };

  render() {
    const {t, classes} = this.props;
    const {path, file, content, loading} = this.state;

    if (loading) {
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
        {content && (
          <div className={classes.editor}>
            <Textarea value={content} onChange={this.changeFileContent}/>
          </div>
        )}
      </>
    );
  }
}

export default injectSheet(styles)(withRouter(translate("plugins")(FileEdit)));
