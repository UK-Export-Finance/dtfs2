import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { ESLint } from 'eslint';
import ts from 'typescript';
import { userIsOnlyInTeams } from '@tfm-ui/helpers/user';
import { CURRENCY } from '@ukef/constants';

const webpack: typeof import('webpack') = require('webpack');
const webpackConfig: import('webpack').Configuration = require('../webpack.common.config');

const projectRoot = path.join(__dirname, '..');

describe('TFM UI source aliases', () => {
  it('should load TFM aliases in Jest without changing shared library aliases', () => {
    // Assert
    expect(typeof userIsOnlyInTeams).toEqual('function');
    expect(CURRENCY.GBP).toEqual('GBP');

    expect(require.resolve('@tfm-ui/constants')).toEqual(path.join(__dirname, 'constants/index.js'));
    expect(require.resolve('@tfm-ui/helpers/user')).toEqual(path.join(__dirname, 'helpers/user.ts'));
    expect(require.resolve('@ukef/dtfs2-common')).toEqual(path.join(projectRoot, '../libs/common/src/index.ts'));
  });

  it.each(['@tfm-ui/constants', '@tfm-ui/helpers/user', '@ukef/constants', '@ukef/dtfs2-common'])(
    'should resolve %s to the same module during compilation and testing',
    (specifier) => {
      // Arrange
      const configPath = path.join(projectRoot, 'tsconfig.json');

      // Act
      const config = ts.readConfigFile(configPath, ts.sys.readFile);

      // Assert
      expect(config.error).toBeUndefined();

      // Act
      const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, projectRoot);

      // Assert
      expect(parsed.errors).toEqual([]);

      // Act
      const { resolvedModule } = ts.resolveModuleName(specifier, __filename, parsed.options, ts.sys);

      // Assert
      expect(resolvedModule?.resolvedFileName).toEqual(require.resolve(specifier));
    },
  );

  it.each([
    ['../../helpers/user', '@tfm-ui/helpers/user'],
    ['./types', './types'],
    ['../../../test-helpers', '../../../test-helpers'],
    ['@ukef/dtfs2-common', '@ukef/dtfs2-common'],
  ])('should autofix %s without changing its source tree', async (specifier, expected) => {
    // Arrange
    const eslint = new ESLint({ cwd: projectRoot, fix: true });
    const source = `import { userIsOnlyInTeams } from '${specifier}';\n\nexport { userIsOnlyInTeams };\n`;

    // Act
    const [result] = await eslint.lintText(source, { filePath: path.join(__dirname, 'controllers/home/index.ts') });

    // Assert
    expect(result.errorCount).toEqual(0);
    expect(result.output ?? source).toEqual(source.replace(specifier, expected));
  });

  it('should not rewrite frontend imports using the server alias', async () => {
    // Arrange
    const eslint = new ESLint({ cwd: projectRoot, fix: true });
    const source = "import { helper } from '../server/helpers/user';\n\nexport { helper };\n";

    // Act
    const [result] = await eslint.lintText(source, { filePath: path.join(projectRoot, 'scripts/main.js') });

    // Assert
    expect(result.errorCount).toEqual(0);
    expect(result.output).toBeUndefined();
  });

  it('should load TFM and common aliases at runtime from another working directory', () => {
    // Arrange
    const script = `
      const assert = require('node:assert/strict');
      const { createRequire } = require('node:module');
      const requireTfm = createRequire(${JSON.stringify(path.join(projectRoot, 'package.json'))});
      assert.equal(typeof requireTfm('@tfm-ui/helpers/user').userIsOnlyInTeams, 'function');
      assert.ok(requireTfm('@tfm-ui/constants').DEAL);
      assert.equal(requireTfm('@ukef/constants').CURRENCY.GBP, 'GBP');
      assert.equal(typeof requireTfm('@ukef/dtfs2-common').asString, 'function');
      assert.throws(() => requireTfm('@tfm-ui/not-a-module'), { code: 'MODULE_NOT_FOUND' });
    `;

    // Act
    const result = spawnSync(process.execPath, ['-r', require.resolve('ts-node/register'), '-e', script], {
      cwd: tmpdir(),
      encoding: 'utf8',
      timeout: 30000,
      env: {
        ...process.env,
        TS_NODE_PROJECT: path.join(projectRoot, 'tsconfig.json'),
        TS_NODE_TRANSPILE_ONLY: 'true',
      },
    });

    // Assert
    expect(result.error).toBeUndefined();
    expect(result.stderr).toEqual('');
    expect(result.status).toEqual(0);
  });

  it.each(['@tfm-ui/constants', '@tfm-ui/helpers/user', '@ukef/constants', '@ukef/dtfs2-common'])(
    'should resolve %s from frontend scripts through Webpack',
    async (specifier) => {
      // Arrange
      const compiler = webpack({ ...webpackConfig, plugins: [] });
      const resolver = compiler.resolverFactory.get('normal', webpackConfig.resolve);

      // Act
      const resolved = await new Promise((resolve, reject) => {
        resolver.resolve({}, path.join(projectRoot, 'scripts'), specifier, {}, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });

      // Assert
      expect(resolved).toEqual(require.resolve(specifier));
    },
  );
});
