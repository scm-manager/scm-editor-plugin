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

import { createSourcesLink } from "./fileUpload";
import { Repository } from "@scm-manager/ui-types";

describe("createSourcesLink", () => {
  it("should create a link with changeset if changeset is given", () => {
    const result = createSourcesLink(rootPath, repositoryTestData, defaultRevision);
    expect(result).toBe("/repo/captain/kirk/code/sources/main");
  });
});

const rootPath: string = "";
const defaultRevision: string = "main";
const repositoryTestData: Repository = { _links: {}, name: "kirk", namespace: "captain", type: "git" };
