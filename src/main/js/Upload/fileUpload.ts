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

import { Changeset, Link, Repository } from "@scm-manager/ui-types";
import { Commit } from "../commit";
import { apiClient } from "@scm-manager/ui-api";
import { createSourceUrl, createSourceUrlFromChangeset, setPathInLink } from "../links";
import { useHistory } from "react-router-dom";
import { useState } from "react";
import { File as SCMFile } from "@scm-manager/ui-types";

type HasPath = { path: string };
type FileAliases = { [key: string]: File & HasPath };
type FileNameMap = { [key: string]: string };

export function useFileCommit() {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();

  function fileCommit(
    path: string,
    files: File[],
    sources: SCMFile,
    revision: string,
    repository: Repository,
    commitMessage?: string,
  ) {
    const link: string = (sources._links.upload as Link).href;
    const fileAliases: FileAliases = buildFileAliases(files);
    setLoading(true);
    if (!commitMessage) {
      commitMessage = "";
    }

    const commit: Commit = {
      commitMessage,
      branch: decodeURIComponent(revision),
      names: buildFileNameMap(fileAliases),
      expectedRevision: null,
    };

    apiClient
      .postBinary(setPathInLink(link, path), (formdata) => {
        Object.keys(fileAliases).forEach((name) => formdata.append(name, fileAliases[name], name));
        formdata.append("commit", JSON.stringify(commit));
      })
      .then((r: Response) => r.json())
      .then((newCommit: Changeset) => {
        history.push(createSourcesLink(path, repository, revision, newCommit));
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }

  return { loading, error, fileCommit };
}

export function removeFileEntry(entry: File, files: File[]): File[] {
  return files.filter((file) => file !== entry);
}

function buildFileAliases(files: File[]): FileAliases {
  const fileAliases: {
    [key: string]: File & HasPath;
  } = {};
  // @ts-ignore File -> File & HasPath is not a clean approach, but works with status quo. Check in case of issues.
  files.forEach((file, i) => (fileAliases["file" + i] = file));
  return fileAliases;
}

function buildFileNameMap(fileAliases: FileAliases): FileNameMap {
  const nameMap: FileNameMap = {};
  Object.keys(fileAliases).forEach(
    (name) =>
      (nameMap[name] =
        fileAliases[name].path.substring(0, fileAliases[name].path.length - fileAliases[name].name.length - 1) +
        (fileAliases[name].path.endsWith("/") ? "" : "/") +
        fileAliases[name].name),
  );
  return nameMap;
}

export function createSourcesLink(path: string, repository: Repository, revision: string, changeset?: Changeset) {
  if (changeset) {
    return createSourceUrlFromChangeset(repository, changeset, path);
  }

  return createSourceUrl(repository, revision, path);
}
