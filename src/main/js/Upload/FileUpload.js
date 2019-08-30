// @flow
import React from "react";
import {translate} from "react-i18next";
import {Subtitle, ButtonGroup, Button} from "@scm-manager/ui-components";
import {File, Me} from "@scm-manager/ui-types";
import FileUploadDropzone from "./FileUploadDropzone";
import FileUploadPath from "./FileUploadPath";
import {withRouter} from "react-router-dom";
import CommitMessage from "../CommitMessage";
import {compose} from "redux";
import {connect} from "react-redux";
import {apiClient} from "@scm-manager/ui-components";


type Props = {
  me?: Me,
  //context props
  t: string => string,
  match: any,
  location: any
};

type State = {
  files?: File[],
  commitMessage?: any
};

class FileUpload extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  handleFile = (file) => {
    this.setState({file});
  };

  commitFile(files, branch, commitMessage) {
    // apiClient.postBinary("url", );
  };

  render() {
    const {t, me} = this.props;
    const filePath = this.props.match.params.path;
    const sourcesLink = this.props.location.pathname.split("upload")[0];
    return (
      <>
        <Subtitle subtitle={t("scm-editor-plugin.upload.title")}/>
        <FileUploadPath path={filePath}/>
        <FileUploadDropzone fileHandler={this.handleFile}/>
        <br/><br/>
        <CommitMessage me={me}/>
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
                action={this.commitFile(this.state.files, "test", this.state.commitMessage)}
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
