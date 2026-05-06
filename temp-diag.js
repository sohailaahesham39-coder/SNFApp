const fs = require("fs");
const ts = require("typescript");

const configPath = ts.findConfigFile(".", ts.sys.fileExists, "tsconfig.json");
if (!configPath) {
  throw new Error("tsconfig.json not found");
}

const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
if (configFile.error) {
  const msg = ts.flattenDiagnosticMessageText(configFile.error.messageText, " ");
  throw new Error(msg);
}

const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, ".");
const program = ts.createProgram({
  rootNames: parsed.fileNames,
  options: parsed.options,
});

const diags = ts.getPreEmitDiagnostics(program);

const output = diags
  .map((d) => {
    const msg = ts.flattenDiagnosticMessageText(d.messageText, " ");
    if (d.file && typeof d.start === "number") {
      const pos = d.file.getLineAndCharacterOfPosition(d.start);
      return `${d.file.fileName}:${pos.line + 1}:${pos.character + 1} - ${msg}`;
    }
    return msg;
  })
  .join("\n");

fs.writeFileSync("diagnostics.txt", output || "NO_DIAGNOSTICS");
