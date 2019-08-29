// @flow
import React from "react";
import {translate} from "react-i18next";
import {Subtitle} from "@scm-manager/ui-components"
import FileUploadDropzone from "./FileUploadDropzone";
import FileUploadPath from "./FileUploadPath";

type Props = {
  path: string,
  //context props
  t: string => string
};

type State = {
  file: any
};

class FileUpload extends React.Component<Props, State> {

  render() {
    const {t, path} = this.props;
    return (
      <>
        <Subtitle subtitle={t("scm-editor-plugin.upload.title")}/>
        <FileUploadPath path={path}/>
        <FileUploadDropzone/>
      </>
    )
  }
}

export default translate("plugins")(FileUpload);
