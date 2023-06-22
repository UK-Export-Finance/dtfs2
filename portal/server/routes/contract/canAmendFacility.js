const { STATUS, USER_ROLES } = require('../../constants');

const canAmendFacility = (userRoles, deal) =>
  userRoles.includes(USER_ROLES.MAKER)
    && deal.status === STATUS.UKEF_ACKNOWLEDGED;

module.exports = canAmendFacility;
