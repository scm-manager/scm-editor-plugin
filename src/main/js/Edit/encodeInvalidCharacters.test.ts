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

import { encodeInvalidCharacters } from "./encodeInvalidCharacters";
describe("encodeInvalidCharacters tests", () => {
  it("should keep characters as written", () => {
    const specialCharacters = encodeInvalidCharacters("!\"'()*-<>");
    const umlautsAndSlashes = encodeInvalidCharacters("abc/äöü\\ß");
    expect(specialCharacters).toBe("!\"'()*-<>");
    expect(umlautsAndSlashes).toBe("abc/äöü\\ß");
  });
  it("should keep encoded characters", () => {
    const specialCharacters = encodeInvalidCharacters("%23%24%26%2B%2C%3A%3D%3F%40%7B%7C%7D"); // #$&+,:=?@{|}
    const percentSign = encodeInvalidCharacters("%25"); // %
    expect(specialCharacters).toBe("%23%24%26%2B%2C%3A%3D%3F%40%7B%7C%7D");
    expect(percentSign).toBe("%25");
  });
  it("should encode invalid characters", () => {
    const invalidCharacters = encodeInvalidCharacters("[]"); // ;[]
    expect(invalidCharacters).toBe("%5B%5D");
  });
});
