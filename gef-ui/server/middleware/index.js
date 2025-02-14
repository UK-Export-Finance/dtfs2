const validateToken = require('./validateToken');
const validateRole = require('./validateRole');
const validateBank = require('./validateBank');
const createRateLimit = require('./rateLimit');
const { csrfToken, copyCsrfTokenFromQueryToBody } = require('./csrf');
const seo = require('./headers/seo.middleware');
const security = require('./headers/security.middleware');

module.exports = {
  validateRole,
  validateToken,
  validateBank,
  createRateLimit,
  csrfToken,
  copyCsrfTokenFromQueryToBody,
  seo,
  security,
};
