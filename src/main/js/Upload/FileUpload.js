// @flow
import React from "react";
import {translate} from "react-i18next";
import {Subtitle, ButtonGroup, Button} from "@scm-manager/ui-components";
import {File, Me, Repository} from "@scm-manager/ui-types";
import FileUploadDropzone from "./FileUploadDropzone";
import FileUploadPath from "./FileUploadPath";
import {withRouter} from "react-router-dom";
import CommitMessage from "../CommitMessage";
import {compose} from "redux";
import {connect} from "react-redux";
import {apiClient} from "@scm-manager/ui-components";
import FileUploadTable from "./FileUploadTable";
import queryString from 'query-string';


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
};

class FileUpload extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      files: [],
      path: this.props.match.params.path ? this.props.match.params.path : "",
      commitMessage: "",
      branch: queryString.parse(this.props.location.search, {ignoreQueryPrefix: true}).branch
    };
  }

  handleFile = (files) => {
    const fileArray = this.state.files ? this.state.files : [];
    files.forEach(file => fileArray.push(file));
    this.setState({files: fileArray});
  };

  changePath = (path) => {
    this.setState({path});
  };

  changeCommitMessage = (commitMessage) => {
    this.setState({commitMessage});
  };

  removeFileEntry = (entry) => {
    const filteredFiles = this.state.files.filter(file => file !== entry);
    this.setState({files: filteredFiles})
  };

  commitFile = () => {
    const {url, repository, history} = this.props;
    const {files, commitMessage, path, branch} = this.state;
    const link = repository._links.fileUpload.href;

    const push = () => history.push(url + "/sources/" + branch.replace("/", "%2F") + "/");

    if (path) {
      apiClient.postBinary(
        link.replace("{path}", path) + (branch ? "?branch=" + branch : ""),
        formdata => {
          files.forEach(file => formdata.append("file", file));
          formdata.append("message", commitMessage);
        }
      ).then(push)
    } else {
      apiClient.postBinary(
        link.replace("/{path}", "") + (branch ? "?branch=" + branch : ""),
        formdata => {
          files.forEach(file => formdata.append("file", file));
          formdata.append("message", commitMessage);
        }
      ).then(push)
    }
  };

  render() {
    const {t, me, location} = this.props;
    const {files, path, commitMessage} = this.state;
    const sourcesLink = location.pathname.split("upload")[0];
    return (
      <>
        <Subtitle subtitle={t("scm-editor-plugin.upload.title")}/>
        <FileUploadPath path={path} changePath={this.changePath}/>
        <FileUploadDropzone fileHandler={this.handleFile}/>
        <br/>
        {
          files && files.length > 0 &&
          <FileUploadTable files={files} removeFileEntry={this.removeFileEntry}/>
        }
        <br/>
        <CommitMessage me={me} commitMessage={commitMessage} onChange={this.changeCommitMessage}/>
        <br/>
        <div className={"level"}>
          <div className={"level-left"}/>
          <div className={"level-right"}>
            <ButtonGroup>
              <Button
                label={t("scm-editor-plugin.upload.button.abort")}
                link={sourcesLink}
              />
              <Button
                label={t("scm-editor-plugin.upload.button.commit")}
                color={"primary"}
                disabled={!commitMessage || files.length === 0}
                action={() => this.commitFile()}
              />
            </ButtonGroup>
          </div>
        </div>
      </>
    )
  }
}

const mapStateToProps = (state) => {
  const {auth} = state;
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
