import * as tsconfigPaths from "tsconfig-paths";
import * as fs from "fs";

export function resolveImportPath(
  importPath: string,
  matchPathFunction: tsconfigPaths.MatchPath
) {
  const extensions = [".ts", ".tsx", ".js", ".jsx"];
  for (const ext of extensions) {
    const tempPath = matchPathFunction(
      importPath + ext,
      undefined,
      undefined,
      extensions
    );
    if (tempPath && fs.existsSync(tempPath)) {
      return tempPath;
    }
  }
  return null;
}
