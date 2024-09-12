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
