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
