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
});
