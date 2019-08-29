// @flow
import React from "react";
import {translate} from "react-i18next";
import {Subtitle} from "@scm-manager/ui-components"
import FileUploadDropzone from "./FileUploadDropzone";
import FileUploadPath from "./FileUploadPath";
import {withRouter} from "react-router-dom";
import CommitMessage from "../CommitMessage";


type Props = {
  //context props
  t: string => string,
  match: any,
  location: any
};

type State = {
  file?: File
};

class FileUpload extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  handleFile = (file) => {
    this.setState({file});
  };

  render() {
    const {t} = this.props;
    const filePath = this.props.match.params.path;
    return (
      <>
        <Subtitle subtitle={t("scm-editor-plugin.upload.title")}/>
        <FileUploadPath path={filePath}/>
        <FileUploadDropzone fileHandler={this.handleFile}/>
        <CommitMessage/>
      </>
    )
  }
}

export default withRouter(translate("plugins")(FileUpload));
