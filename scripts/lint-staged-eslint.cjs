const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');

/**
 * Walks up from the given file's directory to find the nearest ancestor
 * directory containing an `eslint.config.cjs`, falling back to the
 * repository root if none is found above the file.
 */
function findWorkspaceConfigDir(filePath) {
  let dir = path.dirname(filePath);

  for (;;) {
    if (fs.existsSync(path.join(dir, 'eslint.config.cjs'))) {
      return dir;
    }

    if (dir === repoRoot) {
      return repoRoot;
    }

    const parentDir = path.dirname(dir);
    if (parentDir === dir) {
      return repoRoot;
    }

    dir = parentDir;
  }
}

/**
 * Builds the `eslint --fix` commands to run against staged JS/TS files,
 * grouping files by the nearest workspace `eslint.config.cjs`.
 *
 * ESLint's flat config is resolved once per process based on the current
 * working directory, so a single repo-wide `eslint` invocation from the
 * repository root (as `lint-staged` runs commands) would otherwise only
 * ever apply the root's ignores-only config to every staged file. Instead,
 * each group of files is linted with `--config` pointing explicitly at the
 * workspace config that applies to it, matching what `npm run lint` does
 * per-workspace via each workspace's own `lint` script.
 */
module.exports = (stagedFiles) => {
  const filesByConfigDir = new Map();

  stagedFiles.forEach((file) => {
    const configDir = findWorkspaceConfigDir(file);
    const files = filesByConfigDir.get(configDir) ?? [];
    files.push(file);
    filesByConfigDir.set(configDir, files);
  });

  return Array.from(filesByConfigDir.entries()).map(([configDir, files]) => {
    const configPath = path.join(configDir, 'eslint.config.cjs');
    const fileArgs = files.map((file) => `"${file}"`).join(' ');

    return `npx eslint --fix --config "${configPath}" ${fileArgs}`;
  });
};
