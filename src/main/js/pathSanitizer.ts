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

import { useState } from "react";

export const sanitizePath = (path?: string) => {
  const pathWithSlashOnly = path ? path.trim().replace(/\\/g, "/") : "";
  return pathWithSlashOnly.startsWith("/") ? pathWithSlashOnly.substr(1) : pathWithSlashOnly;
};

export const usePathState = (initialPath?: string) => {
  const [path, setInternalPath] = useState(initialPath);
  const [sanitizedPath, setSanitizedPath] = useState(sanitizePath(initialPath));

  const setPath = (newPath: string) => {
    setInternalPath(newPath);
    setSanitizedPath(sanitizePath(newPath));
  };

  return [path, setPath, sanitizedPath] as const;
};
