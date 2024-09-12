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

import { Repository, Changeset } from "@scm-manager/ui-types";
import { sanitizePath } from "./pathSanitizer";

export function createSourceExtensionUrl(repository: Repository, extension: string, revision?: string, path?: string) {
  const url = `/repo/${repository.namespace}/${repository.name}/code/sourceext/${extension}/`;
  return append(url, revision, path);
}

export function createSourceUrl(repository: Repository, revision?: string, path?: string) {
  const url = `/repo/${repository.namespace}/${repository.name}/code/sources/`;

  return append(url, revision, path);
}

export function createSourceUrlFromChangeset(repository: Repository, changeset: Changeset, path?: string) {
  const revision = getBranchOrId(changeset);
  return createSourceUrl(repository, revision, encodePath(path));
}

function getBranchOrId(changeset: Changeset) {
  return changeset._embedded &&
    changeset._embedded.branches &&
    changeset._embedded.branches[0] &&
    changeset._embedded.branches[0].name
    ? changeset._embedded.branches[0].name
    : changeset.id;
}

function append(url: string, revision?: string, path?: string) {
  if (revision) {
    url += encodeURIComponent(revision);
    if (path) {
      url += "/" + path;
    }
  }
  return url;
}

export function setPathInLink(link: string, path: string) {
  const pathToReplace = path ? encodePath(path) : "";
  return link.replace("{path}", pathToReplace);
}

function encodePath(path: string | undefined) {
  if (!path) {
    return "";
  }
  return sanitizePath(path)
    .split("/")
    .map(encodeURIComponent)
    .join("/");
}
