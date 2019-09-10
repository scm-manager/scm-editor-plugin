// @flow
import React from "react";
import type {Branch, Repository} from "@scm-manager/ui-types";
import {translate} from "react-i18next";
import injectSheet from "react-jss";
import classNames from "classnames";
import {Link} from "react-router-dom";

const styles = {
  button: {
    width: "50px"
  }
};

type Props = {
  repository: Repository,
  baseUrl: string,
  path?: string,
  branch?: Branch,
  isBranchUrl: boolean,
  // context props
  classes: any,
  t: string => string
};

class FileCreateButton extends React.Component<Props> {
  createCreateUrl = () => {
    const {baseUrl, path, branch} = this.props;
    let uploadUrl = baseUrl.replace("sources", "create/") + (path ? path : "");

    if (branch) {
      uploadUrl += "?branch=" + encodeURIComponent(branch.name);
      uploadUrl += branch.name
        ? "&revision=" + branch.revision
        : "?revision=" + branch.revision;
    }

    return uploadUrl;
  };

  render() {
    const {classes, t, isBranchUrl, repository} = this.props;
    return (
      <>
        {isBranchUrl && repository._links.fileUpload && (
          <Link to={this.createCreateUrl()}>
            <span
              title={t("scm-editor-plugin.create.tooltip")}
              className={classNames(classes.button, "button has-text-link")}
            >
              <i className="fas fa-file-medical"/>
            </span>
          </Link>
        )}
      </>
    );
  }
}

export default injectSheet(styles)(translate("plugins")(FileCreateButton));
