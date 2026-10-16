const validateToken = require('./validate-token');
const validateRole = require('./validate-role');
const validateBank = require('./validate-bank');
const { validateDealStatusForAmendment } = require('./validate-deal-status-for-amendment');
const createRateLimit = require('./rate-limit');
const seo = require('./headers/seo.middleware');
const security = require('./headers/security.middleware');

module.exports = {
  validateRole,
  validateToken,
  validateBank,
  validateDealStatusForAmendment,
  createRateLimit,
  seo,
  security,
};
