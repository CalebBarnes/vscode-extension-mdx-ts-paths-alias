# MDX TS Path Alias - Go To Definition Extension for VSCode

This Visual Studio Code extension enhances the support for MDX files by enabling the "Go to Definition" feature. It resolves import paths in MDX files using the project's `tsconfig` path aliases, making navigation in your project more efficient and streamlined.

## Features

- **Go to Definition in MDX**: Quickly jump to the definition of imported components or modules directly from your MDX files.
- **Path Resolution**: Seamlessly resolves import paths based on `tsconfig` path aliases, ensuring accurate navigation across different files and directories.

## Installation

To install the extension, follow these steps:

1. Open VSCode.
2. Navigate to the Extensions view by clicking on the square icon on the sidebar or pressing `Ctrl+Shift+X`.
3. Search for "MDX TS Paths Alias - Go To Definition".
4. Click on the install button.

## Usage

Once installed, the extension will automatically enhance the "Go to Definition" functionality in MDX files. Hover over an import statement or a component, and use the usual shortcut (`F12` or `Ctrl+Click`) to jump to its definition.

## Requirements

Make sure you have the "MDX" extension installed in your VSCode editor.

You can install it by searching "MDX" in the Extensions view (`Ctrl+Shift+X`).

## Known Issues

There is a conflict with go to definition on tokens like JSX tags. This is a known issue with the MDX extension.

To resolve this, disable the setting in MDX extension named "Enable experimental IntelliSense support for MDX files".

The json setting:

```json
"mdx.server.enable": false
```

## Contributing

Found a bug or have a feature request? Feel free to open an issue or submit a pull request on our [GitHub repository](https://github.com/CalebBarnes/vscode-extension-mdx-ts-paths-alias).

## License

This extension is released under the [MIT License](https://opensource.org/licenses/MIT).

---

Note: This README is for the VSCode extension that adds enhanced navigation support for MDX files in projects with `tsconfig` path aliases.
