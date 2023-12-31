import * as vscode from "vscode";
import * as tsconfigPaths from "tsconfig-paths";
import * as path from "path";
import * as fs from "fs";
import { findTsconfigPath } from "./helpers/find-tsconfig-path";
import { resolveImportPath } from "./helpers/resolve-import-path";

export function activate(context: vscode.ExtensionContext) {
  let definitionDisposable = vscode.languages.registerDefinitionProvider(
    { scheme: "file", language: "mdx" },
    {
      async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
        // token: vscode.CancellationToken
      ) {
        try {
          const tsconfigPath = await findTsconfigPath(document.uri.fsPath);
          if (tsconfigPath === null) {
            throw new Error("Could not find tsconfig.json");
          }
          const tsconfigDir = path.dirname(tsconfigPath);
          const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));
          const absoluteBaseUrl = path.join(
            tsconfigDir,
            tsconfig.compilerOptions.baseUrl
          );

          const matchPath = tsconfigPaths.createMatchPath(
            absoluteBaseUrl,
            tsconfig.compilerOptions.paths
          );

          const wordRange = document.getWordRangeAtPosition(position);
          const clickedWord = document.getText(wordRange);

          for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const importMatch = line.text.match(
              /import\s+{([^}]*)}\s+from\s+['"](.*)['"]/
            );

            if (importMatch) {
              const mainImportPath = importMatch[1];
              // Check if the hovered text is within the range of the import path
              const importPathRange = new vscode.Range(
                new vscode.Position(i, line.text.indexOf(mainImportPath)),
                new vscode.Position(
                  i,
                  line.text.indexOf(mainImportPath) + mainImportPath.length
                )
              );

              if (importPathRange.contains(position)) {
                // The hovered text is over the import path
                // Resolve the path and provide definition
                const importPath = importMatch[2];
                const resolvedPath = resolveImportPath(importPath, matchPath);
                if (resolvedPath) {
                  return new vscode.Location(
                    vscode.Uri.file(resolvedPath),
                    new vscode.Position(0, 0)
                  );
                }
              }

              const importedItems = importMatch[1]
                .split(",")
                .map((item) => item.trim());
              const importPath = importMatch[2];

              if (importedItems.includes(clickedWord)) {
                const extensions = [".ts", ".tsx", ".js", ".jsx"];
                let resolvedPath;
                for (const ext of extensions) {
                  const tempPath = matchPath(
                    importPath + ext,
                    undefined,
                    undefined,
                    extensions
                  );
                  if (tempPath && fs.existsSync(tempPath)) {
                    resolvedPath = tempPath;
                    break;
                  }
                }

                if (resolvedPath) {
                  const fileContent = fs.readFileSync(resolvedPath, "utf8");
                  const itemDefinitionMatch = new RegExp(
                    `(class|function|const|var|let)\\s+${clickedWord}\\b`
                  ).exec(fileContent);
                  if (itemDefinitionMatch) {
                    const itemDefinitionLine =
                      fileContent
                        .substring(0, itemDefinitionMatch.index)
                        .split("\n").length - 1;
                    return new vscode.Location(
                      vscode.Uri.file(resolvedPath),
                      new vscode.Position(itemDefinitionLine, 0)
                    );
                  }
                }
              } else if (importPath.includes(clickedWord)) {
                // The clicked word is a part of the import path.

                const extensions = [".ts", ".tsx", ".js", ".jsx"];
                let resolvedPath;
                for (const ext of extensions) {
                  const tempPath = matchPath(
                    importPath + ext,
                    undefined,
                    undefined,
                    extensions
                  );
                  if (tempPath && fs.existsSync(tempPath)) {
                    resolvedPath = tempPath;
                    break;
                  }
                }

                if (resolvedPath) {
                  return new vscode.Location(
                    vscode.Uri.file(resolvedPath),
                    new vscode.Position(0, 0)
                  );
                }
              }
            }
          }
        } catch (error) {
          console.error(error);
        }
      },
    }
  );

  // Register Hover Provider
  let hoverDisposable = vscode.languages.registerHoverProvider(
    { scheme: "file", language: "mdx" },
    {
      provideHover(document, position, token) {
        for (let i = 0; i < document.lineCount; i++) {
          const line = document.lineAt(i);
          const importMatch = line.text.match(
            /import\s+{([^}]*)}\s+from\s+['"](.*)['"]/
          );
          if (importMatch) {
            const importPathRange = new vscode.Range(
              new vscode.Position(i, line.text.indexOf(importMatch[2])),
              new vscode.Position(
                i,
                line.text.indexOf(importMatch[2]) + importMatch[2].length
              )
            );
            if (importPathRange.contains(position)) {
              // Provide a hover for the entire import path
              const hoverMessage = new vscode.MarkdownString(
                `**Go to ${importMatch[2]}**`
              );
              hoverMessage.isTrusted = true;
              return new vscode.Hover(hoverMessage, importPathRange);
            }
          }
        }
      },
    }
  );

  context.subscriptions.push(definitionDisposable, hoverDisposable);

  const decorationType = vscode.window.createTextEditorDecorationType({
    textDecoration: "underline",
  });
  function decorateImportPath(editor: vscode.TextEditor, range: vscode.Range) {
    editor.setDecorations(decorationType, [range]);
  }

  vscode.window.onDidChangeTextEditorSelection((event) => {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && event.textEditor === activeEditor) {
      // Clear previous decorations
      activeEditor.setDecorations(decorationType, []);
      for (let i = 0; i < activeEditor.document.lineCount; i++) {
        const line = activeEditor.document.lineAt(i);
        const importMatch = line.text.match(
          /import\s+.*\s+from\s+['"](.*)['"]/
        );
        if (importMatch) {
          const importPath = importMatch[1];
          const startIndex = line.text.indexOf(importPath);
          const endIndex = startIndex + importPath.length;
          const range = new vscode.Range(
            new vscode.Position(i, startIndex),
            new vscode.Position(i, endIndex)
          );
          if (range.contains(event.selections[0].start)) {
            decorateImportPath(activeEditor, range);
            break;
          }
        }
      }
    }
  });
}

export function deactivate() {}
