import React from "react";
import { Branch, File, Repository } from "@scm-manager/ui-types";
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
  path?: string;
  revision?: string;
  sources: File;
};

class FileUploadButton extends React.Component<Props> {
  createUploadUrl = () => {
    const { repository, revision, path } = this.props;
    return createSourceExtensionUrl(repository, "upload", revision, path);
  };

  render() {
    const { t, sources } = this.props;

    return (
      <>
        {sources && sources._links.fileUpload && (
          <Link to={this.createUploadUrl()}>
            <Button title={t("scm-editor-plugin.upload.tooltip")} className="button">
              <i className="fas fa-upload" />
            </Button>
          </Link>
        )}
      </>
    );
  }
}

export default withTranslation("plugins")(FileUploadButton);
