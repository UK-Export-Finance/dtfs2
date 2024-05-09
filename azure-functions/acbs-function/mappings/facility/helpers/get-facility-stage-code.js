const isIssued = require('./is-issued');
const CONSTANTS = require('../../../constants');

const getFacilityStageCode = (facility, dealType) => {
  if (dealType === CONSTANTS.PRODUCT.TYPE.GEF) {
    return facility.hasBeenIssued ? CONSTANTS.FACILITY.STAGE_CODE.ISSUED : CONSTANTS.FACILITY.STAGE_CODE.UNISSUED;
  }

  return isIssued(facility.facilityStage) ? CONSTANTS.FACILITY.STAGE_CODE.ISSUED : CONSTANTS.FACILITY.STAGE_CODE.UNISSUED;
};

module.exports = getFacilityStageCode;
