// @flow
import React from "react";
import {Branch} from "@scm-manager/ui-types";
import {translate} from "react-i18next";
import injectSheet from "react-jss";
import classNames from "classnames";
import {Link} from "react-router-dom";

const styles = {
  button: {
    height: "40px",
    width: "50px",
    color: "#33b2e8",
    "&:hover": {
      color: "#4a4a4a"
    }
  }
};

type Props = {
  baseUrl: string,
  path?: string,
  branch?: Branch,
  isBranchUrl: boolean,
  // context props
  classes: any,
  t: string => string
};

class FileUploadButton extends React.Component<Props> {

  createUploadUrl = () => {
    const {baseUrl, path, branch} = this.props;
    let uploadUrl = baseUrl.replace("sources", "upload/") + (path ? path : "");

    if (branch) {
      uploadUrl += "?branch=" + branch.name;
      uploadUrl += branch.name ? "&revision=" + branch.revision : "?revision=" + branch.revision;
    }

    return uploadUrl;
  };

  render() {
    const {classes, t, isBranchUrl} = this.props;

    return (
      <>
        {isBranchUrl &&
          <Link to={this.createUploadUrl()}>
            <span
              title={t("scm-editor-plugin.upload.tooltip")}
              className={classNames(classes.button, "button")}
            >
                <i className="fas fa-upload"/>
            </span>
          </Link>
        }
      </>
    );
  }
}

export default injectSheet(styles)(translate("plugins")(FileUploadButton));
