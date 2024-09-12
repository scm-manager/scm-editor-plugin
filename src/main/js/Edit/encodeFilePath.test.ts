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

import { encodeFilePath } from "./encodeFilePath";

describe("encodeFilePath tests", () => {
  const basicPath = "src/main/java/com/cloudogu";

  it("should return empty path", () => {
    const emptyPath = encodeFilePath("");
    expect(emptyPath).toBe("");
  });
  it("should append slash at the end", () => {
    const pathWithoutEndingSlash = encodeFilePath(basicPath, true);
    const pathWithEndingSlash = encodeFilePath(basicPath.concat("/"), true);
    expect(pathWithoutEndingSlash).toBe(basicPath.concat("/"));
    expect(pathWithEndingSlash).toBe(basicPath.concat("/"));
  });
  it("should remove slash at the end", () => {
    const pathWithoutEndingSlash = encodeFilePath(basicPath);
    const pathWithEndingSlash = encodeFilePath(basicPath.concat("/"));
    expect(pathWithoutEndingSlash).toBe(basicPath);
    expect(pathWithEndingSlash).toBe(basicPath);
  });
  it("should encode characters of each part between slashes", () => {
    const pathWithSpecialCharacters = encodeFilePath("a#b/c#/öü");
    expect(pathWithSpecialCharacters).toBe("a%23b/c%23/%C3%B6%C3%BC");
  });
  it("should replace backslashes", () => {
    const pathWithBackslash = encodeFilePath("a\\b\\c");
    expect(pathWithBackslash).toBe("a/b/c");
  });
});
