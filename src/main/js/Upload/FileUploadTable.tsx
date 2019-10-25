import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { FileSize, Subtitle } from "@scm-manager/ui-components";
import styled from "styled-components";

const NameColumnTH = styled.th`
  width: 60%;
`;

const NameColumnTD = styled.td`
  width: 60%;
`;

const NoBorderLeft = styled.table`
  & td:first-child {
    border-left: none;
  }
`;

const MarginTop = styled.div`
  margin-top: 2rem;
`;

type Props = WithTranslation & {
  files: File[];
  removeFileEntry: (p: any) => void;
  disabled: boolean;
};

class FileUploadTable extends React.Component<Props> {
  removeEntry = file => {
    this.props.removeFileEntry(file);
  };

  render() {
    const { t, files, disabled } = this.props;

    return (
      <>
        <MarginTop>
          <Subtitle subtitle={t("scm-editor-plugin.upload.file.table.title")} />
        </MarginTop>
        <NoBorderLeft className="card-table table is-hoverable is-fullwidth">
          <thead>
            <tr>
              <NameColumnTH>{t("scm-editor-plugin.upload.file.name")}</NameColumnTH>
              <th className="is-hidden-mobile">{t("scm-editor-plugin.upload.file.type")}</th>
              <th className="is-hidden-mobile">{t("scm-editor-plugin.upload.file.size")}</th>
            </tr>
          </thead>
          <tbody>
            {files.map(file => {
              return (
                <tr>
                  <NameColumnTD>{file.name}</NameColumnTD>
                  <td className="is-hidden-mobile">{file.type}</td>
                  <td className="is-hidden-mobile">
                    <FileSize bytes={file.size} />
                  </td>
                  <td>
                    <a onClick={() => !disabled && this.removeEntry(file)}>
                      <i className="fas fa-trash-alt" />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </NoBorderLeft>
      </>
    );
  }
}

export default withTranslation("plugins")(FileUploadTable);
