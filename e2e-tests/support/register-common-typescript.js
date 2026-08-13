const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const vm = require('node:vm');

const commonRoot = path.resolve(__dirname, '../../libs/common');
const defaultTypeScriptLoader = require.extensions['.ts'];
const typescript = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  if (!filename.startsWith(`${commonRoot}${path.sep}`)) {
    return defaultTypeScriptLoader(module, filename);
  }

  const source = fs.readFileSync(filename, 'utf8');
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

  // Bypass Cypress 15's tsx transform, which does not emit decorator metadata.
  const compiledWrapper = new vm.Script(Module.wrap(outputText), { filename }).runInThisContext();
  compiledWrapper.call(module.exports, module.exports, module.require.bind(module), module, filename, path.dirname(filename));

  return undefined;
};
