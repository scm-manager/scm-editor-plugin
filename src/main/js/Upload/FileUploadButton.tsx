import React from "react";
import { Branch, Repository } from "@scm-manager/ui-types";
import { WithTranslation, withTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import styled from "styled-components";

const Button = styled.span`
  width: 50px;
  color: #33b2e8;
  &:hover {
    color: #363636;
  }
`;

type Props = WithTranslation & {
  repository: Repository;
  baseUrl: string;
  path?: string;
  branch?: Branch;
  isBranchUrl: boolean;
};

class FileUploadButton extends React.Component<Props> {
  createUploadUrl = () => {
    const { baseUrl, path, branch } = this.props;
    let uploadUrl = baseUrl.replace("sources", "upload/") + (path ? path : "");

    if (branch) {
      uploadUrl += "?branch=" + encodeURIComponent(branch.name);
      uploadUrl += branch.name ? "&revision=" + branch.revision : "?revision=" + branch.revision;
    }

    return uploadUrl;
  };

  render() {
    const { t, isBranchUrl, repository } = this.props;

    return (
      <>
        {isBranchUrl && repository._links.fileUpload && (
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
