const validateToken = require('./validateToken');
const validateRole = require('./validateRole');
const validateBank = require('./validateBank');
const csrf = require('./csrf');
const seo = require('./headers/seo.middleware');
const security = require('./headers/security.middleware');

module.exports = {
  validateRole, validateToken, validateBank, csrf, seo, security,
};
