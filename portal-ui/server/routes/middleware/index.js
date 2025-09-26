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

module.exports = {
  validateBank,
  validateBankIdForUser,
  validateMongoId,
  validateSqlId,
  validateToken,
  validateRole,
  security,
  seo,
  createRateLimit,
  virusScanUpload,
};
