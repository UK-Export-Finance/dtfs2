const checkApiKey = require('./headers/check-api-key');
const security = require('./headers/security');
const seo = require('./headers/seo');
const createRateLimit = require('./rate-limit');

module.exports = {
  checkApiKey,
  security,
  seo,
  createRateLimit,
};
