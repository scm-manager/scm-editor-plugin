// @ts-nocheck
const fs = require("fs");
const path = require("path");
const prettier = require("prettier");
const modeDirectory = path.resolve(__dirname, "..", "node_modules", "ace-builds", "src-noconflict");
const targetFile = path.resolve(__dirname, "..", "src", "main", "js", "languages.ts");

const modes = fs
  .readdirSync(modeDirectory)
  .filter(file => file.indexOf("mode-") === 0)
  .map(file => '"' + file.substring(5, file.length - 3) + '"')
  .join(",");

const content = prettier.format(`const languages = [${modes}]; export default languages;`);
fs.writeFileSync(targetFile, content);
