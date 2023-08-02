const checkApiKey = require('./headers/check-api-key');
const security = require('./headers/security');
const seo = require('./headers/seo');
const rateLimit = require('./rateLimit');

module.export = {
  checkApiKey,
  security,
  seo,
  rateLimit,
};
