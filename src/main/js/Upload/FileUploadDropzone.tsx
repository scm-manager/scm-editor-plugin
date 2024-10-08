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
import { DropzoneOptions, useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { binder } from "@scm-manager/ui-extensions";

const StyledDropzone = styled.div`
  width: 100%;
  cursor: pointer;
  padding: 2rem;
`;

const InnerBorder = styled.div`
  display: flex;
  padding: 3rem;
  height: 16rem;
  align-self: center;
  border: dashed 3px #cdcdcd;
  border-radius: 2px;
  justify-content: center;
  text-align: center;
`;

const Description = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Icon = styled.i`
  margin: 1rem 0;
`;

type Props = {
  fileHandler: any;
  disabled: boolean;
  uploadMode: string;
};

const DefaultOptions = {
  multiple: true,
  noDragEventsBubbling: true
};

const FileUploadDropzone: FC<Props> = ({ fileHandler, disabled, uploadMode }) => {
  const [t] = useTranslation("plugins");
  let extension = binder.getExtension("editorPlugin.upload", {});

  const { getRootProps, getInputProps } = useDropzone(
    extension && uploadMode === extension().uploadMode
      ? { ...DefaultOptions, disabled, ...(extension().dropZoneOptions(fileHandler) as DropzoneOptions) }
      : {
          ...DefaultOptions,
          disabled,
          onDrop: fileHandler
        }
  );
  return (
    <section>
      <div {...getRootProps()}>
        <input {...getInputProps()} disabled={disabled} />
        <StyledDropzone>
          <InnerBorder>
            <Description className="has-text-secondary">
              <Icon className="fas fa-plus-circle fa-2x has-text-grey-lighter" />
              {t("scm-editor-plugin.upload.dragAndDrop")}
            </Description>
          </InnerBorder>
        </StyledDropzone>
      </div>
    </section>
  );
};

export default FileUploadDropzone;
