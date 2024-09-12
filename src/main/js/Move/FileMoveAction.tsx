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

import { extensionPoints, ExtractProps } from "@scm-manager/ui-extensions";
import React, { FC, useEffect } from "react";
import MoveModal from "./MoveModal";
import { useMoveFolder } from "./moveFolder";

export const FileMoveAction: FC<ExtractProps<extensionPoints.ModalMenuProps["modalElement"]>> = ({
  close,
  repository,
  file,
  revision,
  setLoading
}) => {
  const { isLoading, error, move } = useMoveFolder();

  useEffect(() => {
    if (setLoading) {
      setLoading(isLoading);
    }
  }, [isLoading, setLoading]);

  return (
    <MoveModal
      onClose={close}
      repository={repository}
      sources={file}
      revision={revision}
      isLoading={isLoading}
      error={error}
      move={move}
    />
  );
};
