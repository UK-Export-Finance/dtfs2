import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import ts from 'typescript';
import { CURRENCY } from '@ukef/constants';
import { getUnixTimestampSeconds } from '@ukef/helpers/date';

const {
  moduleNameMapper,
  webpackAliases,
}: { moduleNameMapper: Record<string, string>; webpackAliases: Record<string, string> } = require('./module-aliases.cjs');

describe('common source aliases', () => {
  it('should load root and nested aliases in Jest', () => {
    //Assert
    expect(CURRENCY.GBP).toEqual('GBP');

    expect(getUnixTimestampSeconds(new Date(0))).toEqual(0);

    expect(require.resolve('@ukef/helpers')).toEqual(path.join(__dirname, 'helpers/index.ts'));
    expect(require.resolve('@ukef/types/date')).toEqual(path.join(__dirname, 'types/date.ts'));
  });

  it.each([
    ['@ukef/dtfs2-common', 'index.ts'],
    ['@ukef/dtfs2-common/test-helpers', 'test-helpers/index.ts'],
    ['@ukef/dtfs2-common/swagger', 'swagger/index.ts'],
  ])('does not remap the public package import %s', (specifier, target) => {
    for (const pattern of Object.keys(moduleNameMapper)) {
      // Assert
      expect(new RegExp(pattern).test(specifier)).toEqual(false);
    }

    // Assert
    expect(webpackAliases[specifier]).toBeUndefined();
    expect(require.resolve(specifier)).toEqual(path.join(__dirname, target));
  });

  it.each(['@ukef/constants', '@ukef/helpers/date', '@ukef/types/date'])('should resolve %s during TypeScript compilation', (specifier) => {
    // Arrange
    const configPath = path.join(__dirname, '../tsconfig.json');
    const config = ts.readConfigFile(configPath, ts.sys.readFile);

    // Assert
    expect(config.error).toBeUndefined();

    const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(configPath));
    expect(parsed.errors).toEqual([]);

    const { resolvedModule } = ts.resolveModuleName(specifier, __filename, parsed.options, ts.sys);

    expect(resolvedModule?.resolvedFileName).toEqual(require.resolve(specifier));
  });

  it('should load the public library and internal aliases at runtime from another working directory', () => {
    // Arrange
    const script = `
      const assert = require('node:assert/strict');
      const { createRequire } = require('node:module');
      const requireCommon = createRequire(${JSON.stringify(path.join(__dirname, '../package.json'))});
      const common = requireCommon('@ukef/dtfs2-common');
      const { CURRENCY } = requireCommon('@ukef/constants');
      const { getUnixTimestampSeconds } = requireCommon('@ukef/helpers/date');
      assert.equal(typeof common.asString, 'function');
      assert.equal(CURRENCY.GBP, 'GBP');
      assert.equal(getUnixTimestampSeconds(new Date(0)), 0);
      assert.throws(() => requireCommon('@ukef/not-a-common-module'), { code: 'MODULE_NOT_FOUND' });
    `;

    // Act
    const result = spawnSync(process.execPath, ['-r', require.resolve('ts-node/register'), '-e', script], {
      cwd: tmpdir(),
      encoding: 'utf8',
      timeout: 30000,
      env: {
        ...process.env,
        TS_NODE_PROJECT: path.join(__dirname, '../tsconfig.json'),
        TS_NODE_TRANSPILE_ONLY: 'true',
      },
    });

    // Assert
    expect(result.error).toBeUndefined();
    expect(result.stderr).toEqual('');
    expect(result.status).toEqual(0);
  });
});
