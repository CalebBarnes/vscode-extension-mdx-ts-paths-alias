import * as fs from "fs/promises";
import * as path from "path";

/**
 * Asynchronously finds the path to the tsconfig.json file.
 * It starts from the given directory and moves up the directory tree.
 *
 * @param {string} startPath - The starting directory path.
 * @return {Promise<string|null>} The path to tsconfig.json, or null if not found.
 */
export async function findTsconfigPath(
  startPath: string
): Promise<string | null> {
  let currentPath = startPath;

  while (true) {
    // Construct the path to tsconfig.json in the current directory
    const tsconfigPath = path.join(currentPath, "tsconfig.json");

    try {
      // Check if tsconfig.json exists at this path
      await fs.access(tsconfigPath);
      return tsconfigPath; // File found, return the path
    } catch {
      // File not found in the current directory, move up
      const parentPath = path.dirname(currentPath);

      // Check if we have reached the root of the file system
      if (parentPath === currentPath) {
        return null; // tsconfig.json not found in any parent directories
      }

      // Update the current path to the parent directory and continue the loop
      currentPath = parentPath;
    }
  }
}
