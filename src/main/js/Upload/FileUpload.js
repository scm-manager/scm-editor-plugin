// @flow
import React from "react";
import {compose} from "redux";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import {translate} from "react-i18next";
import queryString from "query-string";
import type {File, Me, Repository} from "@scm-manager/ui-types";
import {apiClient, Button, ButtonGroup, ErrorNotification, Subtitle} from "@scm-manager/ui-components";
import FileUploadDropzone from "./FileUploadDropzone";
import FilePath from "../FilePath";
import CommitMessage from "../CommitMessage";
import FileUploadTable from "./FileUploadTable";

type Props = {
  me?: Me,
  url: string,
  repository: Repository,

  //context props
  t: string => string,
  match: any,
  location: any,
  history: any
};

type State = {
  path: string,
  files: File[],
  commitMessage: any,
  branch: string,
  revision: string,
  error: Error,
  loading: boolean
};

class FileUpload extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      ...this.state,
      loading: false,
      files: [],
      path: this.props.match.params.path ? this.props.match.params.path : "",
      commitMessage: "",
      branch: queryString.parse(this.props.location.search, {
        ignoreQueryPrefix: true
      }).branch,
      revision: queryString.parse(this.props.location.search, {
        ignoreQueryPrefix: true
      }).revision
    };
  }

  handleError = (error: Error) => {
    this.setState({ error, loading: false });
  };

  handleFile = files => {
    const fileArray = this.state.files ? this.state.files : [];
    files.forEach(file => fileArray.push(file));
    this.setState({ files: fileArray });
  };

  changePath = path => {
    this.setState({ path });
  };

  changeCommitMessage = commitMessage => {
    this.setState({ commitMessage });
  };

  removeFileEntry = entry => {
    const filteredFiles = this.state.files.filter(file => file !== entry);
    this.setState({ files: filteredFiles });
  };

  commitFile = sourcesLink => {
    const { repository, history } = this.props;
    const { files, commitMessage, path, branch } = this.state;
    const link = repository._links.fileUpload.href;

    this.setState({ loading: true });

    apiClient
      .postBinary(
        link.replace("{path}", path) + (branch ? "?branch=" + branch : ""),
        formdata => {
          files.forEach((file, i) => formdata.append("file" + i, file));
          formdata.append("message", commitMessage);
        }
      )
      .then(() => history.push(sourcesLink))
      .catch(this.handleError);
  };

  render() {
    const { t, me, location } = this.props;
    const {
      files,
      path,
      commitMessage,
      branch,
      revision,
      error,
      loading
    } = this.state;
    const sourcesLink =
      location.pathname.split("upload")[0] +
      "sources/" +
      (branch ? branch.replace("/", "%2F") : revision) +
      "/" +
      path;

    return (
      <>
        <Subtitle subtitle={t("scm-editor-plugin.upload.title")} />
        <FilePath path={path} changePath={this.changePath}/>
        <FileUploadDropzone fileHandler={this.handleFile} disabled={loading}/>
        <br />
        {files && files.length > 0 && (
          <FileUploadTable
            files={files}
            removeFileEntry={this.removeFileEntry}
            disabled={loading}
          />
        )}
        <br />
        {error && <ErrorNotification error={error} />}
        <CommitMessage
          me={me}
          commitMessage={commitMessage}
          onChange={this.changeCommitMessage}
          disabled={loading}
        />
        <br />
        <div className="level">
          <div className="level-left" />
          <div className="level-right">
            <ButtonGroup>
              <Button
                label={t("scm-editor-plugin.button.cancel")}
                link={sourcesLink}
                disabled={loading}
              />
              <Button
                label={t("scm-editor-plugin.button.commit")}
                color={"primary"}
                disabled={!commitMessage || files.length === 0}
                action={() => this.commitFile(sourcesLink)}
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
  const { auth } = state;
  const me = auth.me;

  return {
    me
  };
};

export default compose(
  translate("plugins"),
  withRouter,
  connect(mapStateToProps)
)(FileUpload);
