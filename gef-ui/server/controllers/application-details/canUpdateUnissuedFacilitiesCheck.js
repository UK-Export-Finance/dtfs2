const CONSTANTS = require('../../constants/index');
const { MAKER } = require('../../constants/roles');

const canUpdateUnissuedFacilitiesCheck = (application, unissuedFacilities, facilitiesChanged, ukefDecision) => {
  if (!application.userRoles.includes(MAKER)) {
    return false;
  }

  if (!unissuedFacilities || facilitiesChanged.length) {
    return false;
  }

  return ukefDecision || application.submissionType === CONSTANTS.DEAL_SUBMISSION_TYPE.AIN;
};

module.exports = {
  canUpdateUnissuedFacilitiesCheck,
};
