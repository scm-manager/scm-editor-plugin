/*
 * MIT License
 *
 * Copyright (c) 2020-present Cloudogu GmbH and Contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
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
