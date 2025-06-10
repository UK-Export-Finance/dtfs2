const validateToken = require('./validateToken');
const validateRole = require('./validateRole');
const validateBank = require('./validateBank');
const { validateDealStatusForAmendment } = require('./validateDealStatusForAmendment');
const createRateLimit = require('./rateLimit');
const { csrfToken, copyCsrfTokenFromQueryToBody } = require('./csrf');
const seo = require('./headers/seo.middleware');
const security = require('./headers/security.middleware');

module.exports = {
  validateRole,
  validateToken,
  validateBank,
  validateDealStatusForAmendment,
  createRateLimit,
  csrfToken,
  copyCsrfTokenFromQueryToBody,
  seo,
  security,
};
