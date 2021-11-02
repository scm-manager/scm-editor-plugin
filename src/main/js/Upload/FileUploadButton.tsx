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
import { Link } from "react-router-dom";
import styled from "styled-components";
import { File, Repository } from "@scm-manager/ui-types";
import { createAttributesForTesting, Icon } from "@scm-manager/ui-components";
import { createSourceExtensionUrl } from "../links";

type Props = {
  repository: Repository;
  path?: string;
  revision?: string;
  sources: File;
};

const ButtonLink = styled(Link)`
  width: 50px;
  color: #33b2e8;
  &:hover {
    color: #363636;
  }
`;

const FileUploadButton: FC<Props> = ({ repository, revision, path, sources }) => {
  const [t] = useTranslation("plugins");
  return (
    <>
      {sources && sources._links.upload && (
        <ButtonLink
          to={createSourceExtensionUrl(repository, "upload", revision, path)}
          className="button"
          title={t("scm-editor-plugin.upload.tooltip")}
          {...createAttributesForTesting("upload-file-button")}
        >
          <Icon name="upload" color="inherit" />
        </ButtonLink>
      )}
    </>
  );
};

export default FileUploadButton;
