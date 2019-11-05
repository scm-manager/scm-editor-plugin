import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { File, Repository, Link } from "@scm-manager/ui-types";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { apiClient } from "@scm-manager/ui-components";
import { isEditable } from "./isEditable";
import styled from "styled-components";
import { createSourceExtensionUrl } from "../links";

const Button = styled.a`
  width: 50px;
  &:hover {
    color: #33b2e8;
  }
`;

type Props = WithTranslation &
  RouteComponentProps & {
    repository: Repository;
    revision: string;
    file: File;
  };

type State = {
  contentType?: string | null;
  language?: string | null;
  loading: boolean;
};

class FileEditButton extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  componentDidMount() {
    const selfLink = this.props.file._links.self as Link;
    apiClient.head(selfLink.href).then((response: Response) =>
      this.setState({
        loading: false,
        contentType: response.headers.get("Content-Type"),
        language: response.headers.get("X-Programming-Language")
      })
    );
  }

  shouldRender = () => {
    if (!this.props.file._links.modify) {
      return false;
    }
    const { loading, language, contentType } = this.state;
    if (loading) {
      return false;
    }
    return isEditable(contentType, language);
  };

  pushToEditPage() {
    const { repository, revision, file, history } = this.props;
    const url = createSourceExtensionUrl(repository, "edit", revision, file.path);
    history.push(url);
  }

  render() {
    const { t } = this.props;

    return (
      <>
        {this.shouldRender() && (
          <Button title={t("scm-editor-plugin.edit.tooltip")} className="button" onClick={() => this.pushToEditPage()}>
            <i className="fas fa-edit" />
          </Button>
        )}
      </>
    );
  }
}

export default withRouter(withTranslation("plugins")(FileEditButton));
