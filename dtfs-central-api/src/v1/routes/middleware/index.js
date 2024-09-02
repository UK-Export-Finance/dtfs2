const checkApiKey = require('./headers/check-api-key');
const security = require('./headers/security');
const seo = require('./headers/seo');
const createRateLimit = require('./rateLimit');

module.exports = {
  checkApiKey,
  security,
  seo,
  createRateLimit,
};
