// @flow
import React from "react";
import {translate} from "react-i18next";
import injectSheet from "react-jss";
import classNames from "classnames";
import type {File} from "@scm-manager/ui-types";

const styles = {
  button: {
    height: "40px",
    width: "50px",
    "&:hover": {
      color: "#33b2e8"
    }
  }
};

type Props = {
  file: File,
  // context props
  classes: any,
  t: string => string
};

class FileDownloadButton extends React.Component<Props> {

  render() {
    const {file, classes, t} = this.props;
    return (
      <a
        title={t("scm-editor-plugin.download.tooltip")}
        className={classNames(classes.button, "button")}
        href={file._links.self.href}
        download={file.name}
      >
        <i className="fas fa-download"/>
      </a>
    )
  }
}

export default injectSheet(styles)(translate("plugins")(FileDownloadButton));
