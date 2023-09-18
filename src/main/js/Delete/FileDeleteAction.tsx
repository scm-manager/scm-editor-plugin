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
import { Changeset, Link } from "@scm-manager/ui-types";
import FileDeleteModal from "./FileDeleteModal";
import { apiClient } from "@scm-manager/ui-components";
import { useHistory, useLocation } from "react-router-dom";
import styled from "styled-components";
import { extensionPoints, ExtractProps } from "@scm-manager/ui-extensions";

const Pointer = styled.div`
  cursor: initial;
`;

export const FileDeleteAction: FC<ExtractProps<extensionPoints.ModalMenuProps["modalElement"]>> = ({
  revision,
  file,
  handleExtensionError,
  close,
  setLoading: setExtensionLoading
}) => {
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    if (setExtensionLoading) {
      setExtensionLoading(loading);
    }
  }, [loading, setExtensionLoading]);

  const deleteFile = async (commitMessage: string) => {
    setLoading(true);
    apiClient
      .post((file._links.delete as Link).href, {
        commitMessage: commitMessage,
        branch: decodeURIComponent(revision)
      })
      .then(r => r.json())
      .then(async newCommit => {
        if (newCommit) {
          await redirectAfterNewCommit(newCommit);
        }
      })
      .catch(error => {
        handleExtensionError(error);
      });
  };

  const redirectAfterNewCommit = async (newCommit: Changeset) => {
    const newRevision = newCommit._embedded?.branches?.[0]?.name ?? newCommit.id;
    const filePath = location.pathname
      .slice(0, location.pathname.length - file.name.length - 1)
      .split("/sources/" + revision)[1];

    const filePathParts = filePath.split("/");
    const checkFolderBaseUrl =
      (newCommit._links.self as Link).href.split("/changesets/")[0] + `/sources/${encodeURIComponent(newRevision)}`;
    let exists = false;
    while (!exists) {
      try {
        await apiClient.get(checkFolderBaseUrl + filePathParts.join("/"));
        exists = true;
      } catch (err) {
        filePathParts.pop();
      }
    }

    const redirectUrl =
      location.pathname.split("/sources")[0] + `/sources/${encodeURIComponent(newRevision)}${filePathParts.join("/")}`;
    history.push(redirectUrl);
  };

  return (
    <Pointer>
      <FileDeleteModal onClose={close} onCommit={deleteFile} file={file} loading={loading} />
    </Pointer>
  );
};

export default FileDeleteAction;
