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
