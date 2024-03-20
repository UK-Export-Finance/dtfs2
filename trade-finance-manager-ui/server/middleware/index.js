const { validateMongoId } = require('./validateMongoId');
const { validateSqlId } = require('./validateSqlId');
const validateUserTeam = require('./validateUserTeam');
const { validateUser } = require('./user-validation');

module.exports = {
  validateSqlId,
  validateMongoId,
  validateUserTeam,
  validateUser,
};
