const validateBank = require('./validate-bank');
const validateBankIdForUser = require('./validate-bank-id-for-user');
const validateMongoId = require('./validate-mongo-id');
const { validateSqlId } = require('./validate-sql-id');
const validateToken = require('./validate-token');
const validateRole = require('./validate-role');
const security = require('./headers/security.middleware');
const seo = require('./headers/seo.middleware');
const createRateLimit = require('./rate-limit');
const virusScanUpload = require('./virus-scan-upload');

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
