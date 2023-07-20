const validateBank = require('./validateBank');
const validateToken = require('./validateToken');
const validateRole = require('./validateRole');
const security = require('./headers/security.middleware');
const seo = require('./headers/seo.middleware');
const csrf = require('./csrf');
const { queryParams } = require('./query-params');

module.exports = {
  validateBank, validateToken, validateRole, csrf, security, seo, queryParams,
};
