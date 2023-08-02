const validateBank = require('./validateBank');
const validateToken = require('./validateToken');
const validateRole = require('./validateRole');
const security = require('./headers/security.middleware');
const seo = require('./headers/seo.middleware');
const rateLimit = require('./rateLimit');
const { csrfToken, copyCsrfTokenFromQueryToBody } = require('./csrf');

module.exports = {
  validateBank,
  validateToken,
  validateRole,
  csrfToken,
  copyCsrfTokenFromQueryToBody,
  security,
  seo,
  rateLimit,
};
