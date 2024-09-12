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

import { validateNewFilename, validateNewPath } from "./moveDialogValidation";

describe("for path move", () => {
  it("should accept simple path", () => {
    expect(validateNewPath("/simple/path", true)).toEqual("");
  });

  it("should reject root path", () => {
    expect(validateNewPath("/", true)).toEqual("scm-editor-plugin.move.newPath.errors.pattern");
  });

  it("should reject path without leading /", () => {
    expect(validateNewPath("simple/path", true)).toEqual("scm-editor-plugin.move.newPath.errors.pattern");
  });

  it("should reject empty path", () => {
    expect(validateNewPath("", true)).toEqual("scm-editor-plugin.move.newPath.errors.empty");
  });

  it("should reject path with backslash", () => {
    expect(validateNewPath("/wrong\\path", true)).toEqual("scm-editor-plugin.move.newPath.errors.pattern");
  });
});

describe("for file move", () => {
  it("should accept simple path", () => {
    expect(validateNewPath("/simple/path", false)).toEqual("");
  });

  it("should accept root path", () => {
    expect(validateNewPath("/", false)).toEqual("");
  });

  it("should reject path without leading /", () => {
    expect(validateNewPath("simple/path", false)).toEqual("scm-editor-plugin.move.newPath.errors.pattern");
  });

  it("should reject empty path", () => {
    expect(validateNewPath("", false)).toEqual("scm-editor-plugin.move.newPath.errors.empty");
  });

  it("should reject path with backslash", () => {
    expect(validateNewPath("/wrong\\path", false)).toEqual("scm-editor-plugin.move.newPath.errors.pattern");
  });

  it("should accept simple filename", () => {
    expect(validateNewFilename("newFile.txt")).toEqual("");
  });

  it("should reject empty filename", () => {
    expect(validateNewFilename("")).toEqual("scm-editor-plugin.move.newFilename.errors.empty");
  });

  it("should reject filename with slash", () => {
    expect(validateNewFilename("some/file")).toEqual("scm-editor-plugin.move.newFilename.errors.pattern");
  });

  it("should reject filename with backslash", () => {
    expect(validateNewFilename("some\\file")).toEqual("scm-editor-plugin.move.newFilename.errors.pattern");
  });
});
