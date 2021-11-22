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
  return createSourceUrl(repository, revision, sanitizePath(path));
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
