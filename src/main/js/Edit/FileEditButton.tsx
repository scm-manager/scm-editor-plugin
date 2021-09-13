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
import React, { FC, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { File, Link, Repository } from "@scm-manager/ui-types";
import { apiClient, createAttributesForTesting } from "@scm-manager/ui-components";
import { createSourceExtensionUrl } from "../links";
import { isEditable } from "./isEditable";
import { encodeFilePath } from "./encodeFilePath";

const Button = styled.a`
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
  const [t] = useTranslation("plugins");
  const [contentType, setContentType] = useState<string | null>();
  const [language, setLanguage] = useState<string | null>();
  const [loading, setLoading] = useState(true);

  const history = useHistory();

  useEffect(() => {
    const selfLink = file._links.self as Link;
    apiClient.head(selfLink.href).then((response: Response) => {
      setLoading(false);
      setContentType(response.headers.get("Content-Type"));
      setLanguage(response.headers.get("X-Programming-Language"));
    });
  });

  const shouldRender = () => {
    if (!file._links.modify || loading) {
      return false;
    }
    return isEditable(contentType, language);
  };

  const pushToEditPage = () => {
    const url = createSourceExtensionUrl(repository, "edit", revision, encodeFilePath(file.path));
    history.push(url);
  };

  return (
    <>
      {shouldRender() && (
        <Button
          title={t("scm-editor-plugin.edit.tooltip")}
          className="button"
          onClick={() => pushToEditPage()}
          {...createAttributesForTesting("edit-file-button")}
        >
          <i className="fas fa-edit" />
        </Button>
      )}
    </>
  );
};

export default FileEditButton;
