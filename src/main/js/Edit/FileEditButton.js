// @flow
import React from "react";
import {translate} from "react-i18next";
import type {File} from "@scm-manager/ui-types";
import {withRouter} from "react-router-dom";
import {apiClient} from "@scm-manager/ui-components";
import {isEditable} from "./isEditable";
import styled from "styled-components";

const Button = styled.a`
  width: 50px;
  &:hover {
    color: #33b2e8;
  }
`;

type Props = {
  file: File,

  // context props
  t: string => string,
  location: any,
  history: History,
  match: any
};

type State = {
  contentType: string,
  language: string,
  contentLength: number,
  loading: boolean
};

class FileEditButton extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { loading: true };
  }

  componentDidMount() {
    apiClient.head(this.props.file._links.self.href).then(response =>
      this.setState({
        loading: false,
        contentLength: parseInt(response.headers.get("Content-Length")),
        contentType: response.headers.get("Content-Type"),
        language: response.headers.get("X-Programming-Language")
      })
    );
  }

  shouldRender = () => {
    if (!this.props.file._links.modify) {
      return false;
    }
    const { loading, language, contentType, contentLength } = this.state;
    if (loading) {
      return false;
    }
    return isEditable(contentType, language, contentLength);
  };

  pushToEditPage() {
    const { match, location, history } = this.props;
    history.push(
      location.pathname.split("sources/")[0] +
        "edit/" +
        match.params.path +
        "?branch=" +
        match.params.revision
    );
  }

  render() {
    const {t} = this.props;

    return (
      <>
        {this.shouldRender() && (
          <Button
            title={t("scm-editor-plugin.edit.tooltip")}
            className="button"
            onClick={() => this.pushToEditPage()}
          >
            <i className="fas fa-edit" />
          </Button>
        )}
      </>
    );
  }
}

export default withRouter(translate("plugins")(FileEditButton));
