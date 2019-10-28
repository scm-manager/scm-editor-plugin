import React from "react";
import {Branch, File} from "@scm-manager/ui-types";
import {WithTranslation, withTranslation} from "react-i18next";
import {Link} from "react-router-dom";
import styled from "styled-components";

const Button = styled.span`
  width: 50px;
  color: #33b2e8;
  &:hover {
    color: #363636;
  }
`;

type Props = WithTranslation & {
  baseUrl: string;
  path?: string;
  branch?: Branch;
  revision?: string;
  sources: File;
};

class FileCreateButton extends React.Component<Props> {
  createCreateUrl = () => {
    const { baseUrl, path, branch, revision } = this.props;
    let uploadUrl = baseUrl.replace("sources", "create/") + (path ? path : "");

    if (!revision && branch) {
      uploadUrl += "?branch=" + encodeURIComponent(branch.name);
      uploadUrl += branch.name ? "&revision=" + branch.revision : "?revision=" + branch.revision;
    }

    return uploadUrl;
  };

  render() {
    const { t, sources } = this.props;
    return (
      <>
        {sources && sources._links.fileUpload && (
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
