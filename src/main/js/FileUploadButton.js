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
  baseUrl: any,
  // context props
  classes: any,
  t: string => string
};

class FileUploadButton extends React.Component<Props> {

  render() {
    const {baseUrl, classes, t} = this.props;
    return (
      <>
        <span
          title={t("scm-editor-plugin.upload.tooltip")}
          className={classNames(classes.button, "button")}
        >
          <Link to={baseUrl + "/upload"}>
            <i className="fas fa-upload"/>
          </Link>
        </span>
      </>
    )
  }
}

export default injectSheet(styles)(translate("plugins")(FileUploadButton));
