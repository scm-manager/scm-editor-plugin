// @flow
import React from "react";
import {translate} from "react-i18next";
import injectSheet from "react-jss";
import classNames from "classnames";
import type {File} from "@scm-manager/ui-types";
import {withRouter} from "react-router-dom";
import {apiClient} from "@scm-manager/ui-components";
import {isEditable} from "./isEditable";

const styles = {
  button: {
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
  t: string => string,
  location: any,
  history: any,
  match: any
};

type State = {
  contentType: string,
  language: string,
  loading: boolean
}

class FileEditButton extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {loading: true};
  }

  componentDidMount() {
    apiClient
      .head(this.props.file._links.self.href)
      .then(response => this.setState({
          loading: false,
          contentType: response.headers.get("Content-Type"),
          language: response.headers.get("X-Programming-Language"),
        })
      );
  }

  shouldRender = () => {
    if (!this.props.file._links.modify) {
      return false
    }
    const { loading, language, contentType } = this.state;
    if (loading) {
      return false;
    }
    return isEditable(contentType, language);
  };

  pushToEditPage() {
    const {match, location, history} = this.props;
    history.push(
      location.pathname.split("sources/")[0] +
      "edit/" +
      match.params.path + "?branch=" +
      match.params.revision
    );
  }

  render() {
    const {classes, t} = this.props;

    return (
      <>
        {this.shouldRender() && (
          <a
            title={t("scm-editor-plugin.edit.tooltip")}
            className={classNames(classes.button, "button")}
            onClick={() => this.pushToEditPage()}
          >
            <i className="fas fa-edit"/>
          </a>
        )}
      </>
    );
  }
}

export default injectSheet(styles)(withRouter(translate("plugins")(FileEditButton)));
