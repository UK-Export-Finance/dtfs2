const { register } = require('tsconfig-paths');

register({
  baseUrl: __dirname,
  paths: { '@tfm-ui/*': ['*'] },
  addMatchAll: false,
});
