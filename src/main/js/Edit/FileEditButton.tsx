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
import { useContentType } from "@scm-manager/ui-api";
import { useTranslation } from "react-i18next";
import { File, Link, Repository } from "@scm-manager/ui-types";
import { createAttributesForTesting, Icon } from "@scm-manager/ui-components";
import { createSourceExtensionUrl } from "../links";
import { isEditable } from "./isEditable";
import { encodeFilePath } from "./encodeFilePath";
import styled from "styled-components";
import { Link as RouterLink } from "react-router-dom";

const ButtonStyleLink = styled(RouterLink)`
  width: 50px;
  &:hover {
    color: #33b2e8;
  }
`;

type Props = {
  repository: Repository;
  revision: string;
  file: File;
};

const FileEditButton: FC<Props> = ({ repository, revision, file }) => {
  const { data, isLoading } = useContentType((file._links.self as Link).href);
  const [t] = useTranslation("plugins");

  const shouldRender = () => {
    if (!file._links.modify || isLoading || !data) {
      return false;
    }
    return isEditable(data.type, data.language);
  };

  const createUrl = () => {
    return createSourceExtensionUrl(repository, "edit", revision, encodeFilePath(file.path));
  };

  if (!shouldRender()) {
    return null;
  }

  return (
    <ButtonStyleLink
      to={createUrl()}
      title={t("scm-editor-plugin.edit.tooltip")}
      className="button"
      {...createAttributesForTesting("edit-file-button")}
    >
      <Icon name="edit" color="inherit" />
    </ButtonStyleLink>
  );
};

export default FileEditButton;
