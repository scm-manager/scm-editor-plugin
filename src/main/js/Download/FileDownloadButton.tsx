import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { File } from "@scm-manager/ui-types";
import styled from "styled-components";

const Button = styled.a`
  width: 50px;
  &:hover {
    color: #33b2e8;
  }
`;

type Props = WithTranslation & {
  file: File;
};

class FileDownloadButton extends React.Component<Props> {
  render() {
    const { file, t } = this.props;
    return (
      <Button
        title={t("scm-editor-plugin.download.tooltip")}
        className="button"
        href={file._links.self.href}
        download={file.name}
      >
        <i className="fas fa-download" />
      </Button>
    );
  }
}

export default withTranslation("plugins")(FileDownloadButton);
