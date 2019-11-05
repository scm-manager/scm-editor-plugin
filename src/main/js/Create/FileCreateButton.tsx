import React from "react";
import { File, Repository } from "@scm-manager/ui-types";
import { WithTranslation, withTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { createSourceExtensionUrl } from "../links";

const Button = styled.span`
  width: 50px;
  color: #33b2e8;
  &:hover {
    color: #363636;
  }
`;

type Props = WithTranslation & {
  repository: Repository;
  revision?: string;
  path?: string;
  sources: File;
};

class FileCreateButton extends React.Component<Props> {
  createCreateUrl = () => {
    const { repository, revision, path } = this.props;

    return createSourceExtensionUrl(repository, "create", revision, path);
  };

  render() {
    const { t, sources } = this.props;
    return (
      <>
        {sources && sources._links.upload && (
          <Link to={this.createCreateUrl()}>
            <Button title={t("scm-editor-plugin.create.tooltip")} className="button">
              <i className="fas fa-file-medical" />
            </Button>
          </Link>
        )}
      </>
    );
  }
}

export default withTranslation("plugins")(FileCreateButton);
