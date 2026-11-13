const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

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
 * Groups the given staged files by the workspace directory whose
 * `eslint.config.cjs` applies to them.
 */
function groupFilesByConfigDir(files) {
  const filesByConfigDir = new Map();

  files.forEach((file) => {
    const configDir = findWorkspaceConfigDir(file);
    const group = filesByConfigDir.get(configDir) ?? [];
    group.push(file);
    filesByConfigDir.set(configDir, group);
  });

  return filesByConfigDir;
}

/**
 * Runs a single command to completion, returning its combined output and
 * whether it succeeded.
 */
function run(command, args, options) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    shell: process.platform === 'win32',
    ...options,
  });

  const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();

  return { success: result.status === 0, output };
}

/**
 * Lints (and fixes) the given staged JS/TS files, grouped by workspace, then
 * formats them with Prettier.
 *
 * ESLint's flat config resolves the config file to use - and the `files`/
 * `ignores` glob patterns within it - relative to the process's current
 * working directory. Pointing `--config` at a workspace's `eslint.config.cjs`
 * from a different cwd (e.g. the repository root) does NOT fix this: any
 * relative patterns in that config (such as a workspace's `public/` ignore
 * or a `scripts/**\/*.js` override) would still be matched against the
 * wrong base path. Each group of files is therefore linted in its own child
 * process with `cwd` set to its owning workspace directory, matching what
 * `npm run lint` does per-workspace via each workspace's own `lint` script.
 */
module.exports = {
  title: 'eslint --fix && prettier --write',
  task: async (stagedFiles, { log }) => {
    const filesByConfigDir = groupFilesByConfigDir(stagedFiles);
    const failures = [];

    filesByConfigDir.forEach((files, configDir) => {
      /**
       * ESLint resolves `files`/`ignores` glob patterns against a `cwd`-relative
       * base path, so staged paths are passed relative to `configDir` (rather
       * than absolute) to ensure they match correctly.
       */
      const relativeFiles = files.map((file) => path.relative(configDir, file));
      const { success, output } = run('npx', ['eslint', '--fix', ...relativeFiles], { cwd: configDir });

      if (output) {
        log(output);
      }

      if (!success) {
        failures.push(configDir);
      }
    });

    if (failures.length > 0) {
      throw new Error(`eslint failed for: ${failures.join(', ')}`);
    }

    const { success, output } = run('npx', ['prettier', '--write', ...stagedFiles], { cwd: repoRoot });

    if (output) {
      log(output);
    }

    if (!success) {
      throw new Error('prettier --write failed');
    }
  },
};
