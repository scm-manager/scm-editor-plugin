/*
 * Copyright (c) 2020 - present Cloudogu GmbH
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see https://www.gnu.org/licenses/.
 */

import React, { FC } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { FileSize } from "@scm-manager/ui-components";
import { Button, Icon, Subtitle } from "@scm-manager/ui-core";
import { File } from "@scm-manager/ui-types";

type Props = {
  files: File[];
  removeFileEntry: (entry: File) => void;
  disabled: boolean;
};

const NoBorderLeft = styled.table`
  & td:first-child {
    border-left: none;
  }
`;

const FixedColumnTH = styled.th`
  width: 30%;
  max-width: 30%;
`;

const FixedColumnTD = styled.td`
  width: 30%;
  max-width: 30%;
`;

const FileUploadTable: FC<Props> = ({ files, removeFileEntry, disabled }) => {
  const [t] = useTranslation("plugins");

  const deleteThis = (file: File) => {
    if (!disabled) {
      removeFileEntry(file);
    }
  };
  return (
    <>
      <Subtitle className="mt-5" subtitle={t("scm-editor-plugin.upload.file.table.title")} />
      <NoBorderLeft className="card-table table is-hoverable is-fullwidth">
        <thead>
          <tr>
            <FixedColumnTH className="is-hidden-mobile">{t("scm-editor-plugin.upload.file.path")}</FixedColumnTH>
            <FixedColumnTH>{t("scm-editor-plugin.upload.file.name")}</FixedColumnTH>
            <th className="is-hidden-mobile">{t("scm-editor-plugin.upload.file.size")}</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file, idx) => {
            return (
              <tr>
                <FixedColumnTD className="is-vcentered">
                  {file.path.substring(0, file.path.length - file.name.length)}
                </FixedColumnTD>
                <FixedColumnTD className="is-vcentered">
                  <p id={`fileUploadDeleteColumn-` + idx}>{file.name}</p>
                </FixedColumnTD>
                <td className="is-hidden-mobile is-center">
                  <FileSize bytes={file.size} />
                </td>
                <td className="is-vcentered">
                  <Button
                    color="inherit"
                    aria-label={t("scm-editor-plugin.upload.delete")}
                    aria-describedby={`fileUploadDeleteColumn-` + idx}
                    title={t("scm-editor-plugin.upload.delete")}
                    onClick={() => deleteThis(file)}
                    onKeyDown={(event) => {
                      if (!event.ctrlKey && (event.key == "Enter" || event.key == " ")) {
                        deleteThis(file);
                      }
                    }}
                  >
                    <Icon alt={t("scm-editor-plugin.upload.delete")}>trash</Icon>
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </NoBorderLeft>
    </>
  );
};

export default FileUploadTable;
