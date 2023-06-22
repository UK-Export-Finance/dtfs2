const { FACILITY_STAGE, STATUS, USER_ROLES } = require('../../constants');

const canAmendFacility = (userRoles, deal, facility) =>
  userRoles.includes(USER_ROLES.MAKER)
    && deal.status === STATUS.UKEF_ACKNOWLEDGED
    && facility.facilityStage === FACILITY_STAGE.ISSUED;

module.exports = canAmendFacility;
