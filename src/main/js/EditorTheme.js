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
