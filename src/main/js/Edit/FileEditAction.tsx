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

import { FC, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { createSourceExtensionUrl } from "../links";
import { encodeFilePath } from "./encodeFilePath";
import { extensionPoints } from "@scm-manager/ui-extensions";

export const FileEditAction: FC<extensionPoints.ActionBarExtensionsProps> = ({ repository, revision, file }) => {
  const history = useHistory();

  useEffect(() => {
    history.push(createSourceExtensionUrl(repository, "edit", revision, encodeFilePath(file.path)));
  });

  return null;
};
