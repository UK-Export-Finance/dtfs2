const CONSTANTS = require('../../constants');

const canAmendFacility = (userRoles) => userRoles.includes(CONSTANTS.USER_ROLES.MAKER);

module.exports = canAmendFacility;
