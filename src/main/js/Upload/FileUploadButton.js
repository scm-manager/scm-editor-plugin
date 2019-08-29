// @flow
import React from "react";
import {translate} from "react-i18next";
import injectSheet from "react-jss";
import classNames from "classnames";
import {Link} from "react-router-dom";

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
  baseUrl: string,
  path?: string,
  branch?: string,
  revision?: string,
  // context props
  classes: any,
  t: string => string
};

class FileUploadButton extends React.Component<Props> {

  createUploadUrl = () => {
    const {baseUrl, path, branch, revision} = this.props;
    let uploadUrl = baseUrl.replace("sources", "upload/") + (path ? path : "");

    if (branch) {
      uploadUrl += "?branch=" + branch
    }

    if (revision) {
      uploadUrl += branch ? "&revision=" + revision : "?revision=" + revision;
    }

    return uploadUrl;
  };

  render() {
    const {classes, t, path} = this.props;

    return (
      <>
        {
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
    )
  }
}

export default injectSheet(styles)(translate("plugins")(FileUploadButton));
