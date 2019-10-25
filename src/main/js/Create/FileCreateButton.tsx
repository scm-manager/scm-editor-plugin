import React from "react";
import { Branch, Repository } from "@scm-manager/ui-types";
import { translate } from "react-i18next";
import { Link } from "react-router-dom";
import styled from "styled-components";

const Button = styled.span`
  width: 50px;
  color: #33b2e8;
  &:hover {
    color: #363636;
  }
`;

type Props = {
  repository: Repository;
  baseUrl: string;
  path?: string;
  branch?: Branch;
  isBranchUrl: boolean;
  // context props
  t: (p: string) => string;
};

class FileCreateButton extends React.Component<Props> {
  createCreateUrl = () => {
    const { baseUrl, path, branch } = this.props;
    let uploadUrl = baseUrl.replace("sources", "create/") + (path ? path : "");

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

export default translate("plugins")(FileCreateButton);
