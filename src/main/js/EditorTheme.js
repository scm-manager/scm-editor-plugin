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
// @ts-nocheck
// copy of ace/theme/arduino-tomorrow
import css from '!!raw-loader!./EditorTheme.css';

ace.define("ace/theme/arduino-light", ["require", "exports", "module", "ace/lib/dom"], function(
  require,
  exports,
  module
) {
  exports.isDark = false;
  exports.cssClass = "ace-arduino-light";
  exports.cssText = css;

  var dom = require("../lib/dom");
  dom.importCssString(exports.cssText, exports.cssClass);
});
(function() {
  ace.require(["ace/theme/arduino-light"], function(m) {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m;
    }
  });
})();
