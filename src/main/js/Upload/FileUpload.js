// @flow
import React from "react";
import {translate} from "react-i18next";
import {Subtitle, FileUploadDropzone} from "@scm-manager/ui-components";

type Props = {
  //context props
  t: string => string
};

type State = {
  file: any
};

class FileUpload extends React.Component<Props, State> {

  render() {
    const {t} = this.props;
    return (
      <>
        <Subtitle subtitle={t("scm-editor-plugin.upload.title")}/>
        <FileUploadDropzone/>

      </>
    )
  }
}

export default translate("plugins")(FileUpload);
