const CONSTANTS = require('../../constants/index');

const canUpdateUnissuedFacilitiesCheck = (application, unissuedFacilities, facilitiesChanged, UkefDecision) => {
  if (application.submissionType === CONSTANTS.DEAL_SUBMISSION_TYPE.AIN) {
    if (unissuedFacilities && !facilitiesChanged.length) {
      return true;
    }
  } else if (unissuedFacilities && !facilitiesChanged.length && UkefDecision) {
    return true;
  }

  return false;
};

module.exports = {
  canUpdateUnissuedFacilitiesCheck,
};
