const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const vm = require('node:vm');

/**
 * Cypress 15 uses tsx to load TypeScript in its Node process. That transform
 * does not emit the decorator metadata required by the TypeORM entities
 * exported as TypeScript source by @ukef/dtfs2-common.
 *
 * This module installs a scoped loader that compiles files under libs/common
 * with the TypeScript compiler and decorator metadata enabled. All other
 * TypeScript files continue to use Cypress's loader.
 *
 * This module must be required before importing @ukef/dtfs2-common.
 */
const commonRoot = path.resolve(__dirname, '../../libs/common');
const defaultTypeScriptLoader = require.extensions['.ts'];
const typescript = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  // Preserve Cypress's normal TypeScript handling outside the shared package.
  if (!filename.startsWith(`${commonRoot}${path.sep}`)) {
    if (typeof defaultTypeScriptLoader !== 'function') {
      throw new Error(`Cannot load TypeScript file outside libs/common because Cypress's TypeScript loader is not registered: ${filename}`);
    }

    return defaultTypeScriptLoader(module, filename);
  }

  const source = fs.readFileSync(filename, 'utf8');

  // Transpile only: type-checking remains the responsibility of the normal
  // build and type-check commands. The decorator options mirror libs/common's
  // tsconfig so TypeORM can infer reflected property types at runtime, while
  // CommonJS output allows Node to execute the result through require().
  const { outputText } = typescript.transpileModule(source, {
    compilerOptions: {
      emitDecoratorMetadata: true,
      esModuleInterop: true,
      experimentalDecorators: true,
      module: typescript.ModuleKind.CommonJS,
      target: typescript.ScriptTarget.ES2018,
    },
    fileName: filename,
  });

  // Execute the CommonJS output using Node's standard module wrapper.
  const compiledWrapper = new vm.Script(Module.wrap(outputText), { filename }).runInThisContext();
  compiledWrapper.call(module.exports, module.exports, module.require.bind(module), module, filename, path.dirname(filename));

  return undefined;
};
