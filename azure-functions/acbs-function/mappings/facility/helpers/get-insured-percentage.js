const CONSTANTS = require('../../../constants');

const getInsuredPercentage = (facilityStageCode) => {
  if (facilityStageCode === CONSTANTS.FACILITY.STAGE_CODE.ISSUED) {
    return CONSTANTS.FACILITY.GUARANTEE_PERCENTAGE.ISSUED;
  }
  return CONSTANTS.FACILITY.GUARANTEE_PERCENTAGE.UNISSUED;
};

module.exports = getInsuredPercentage;
