const validateBank = require('./validateBank');
const validateBankIdForUser = require('./validateBankIdForUser');
const validateMongoId = require('./validateMongoId');
const { validateSqlId } = require('./validateSqlId');
const validateToken = require('./validateToken');
const validateRole = require('./validateRole');
const security = require('./headers/security.middleware');
const seo = require('./headers/seo.middleware');
const createRateLimit = require('./rateLimit');
const virusScanUpload = require('./virusScanUpload');
const { csrfToken, copyCsrfTokenFromQueryToBody } = require('./csrf');

module.exports = {
  validateBank,
  validateBankIdForUser,
  validateMongoId,
  validateSqlId,
  validateToken,
  validateRole,
  csrfToken,
  copyCsrfTokenFromQueryToBody,
  security,
  seo,
  createRateLimit,
  virusScanUpload,
};
