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
import { FileSize, Icon, Subtitle, Tooltip } from "@scm-manager/ui-components";

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
          {files.map(file => {
            return (
              <tr>
                <FixedColumnTD>{file.path.substring(0, file.path.length - file.name.length)}</FixedColumnTD>
                <FixedColumnTD>{file.name}</FixedColumnTD>
                <td className="is-hidden-mobile">
                  <FileSize bytes={file.size} />
                </td>
                <td>
                  <Tooltip message={t("scm-editor-plugin.upload.delete")} location="top">
                    <Icon
                      name="trash"
                      color="inherit"
                      onClick={() => !disabled && removeFileEntry(file)}
                      alt={t("scm-editor-plugin.upload.delete")}
                    />
                  </Tooltip>
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
