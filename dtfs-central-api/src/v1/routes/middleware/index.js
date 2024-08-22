const checkApiKey = require('./headers/check-api-key');
const security = require('./headers/security');
const seo = require('./headers/seo');
const createRateLimit = require('./rateLimit');
const bugFixLogs = require('./bug-fix-logs');

module.exports = {
  checkApiKey,
  security,
  seo,
  createRateLimit,
  bugFixLogs,
};
