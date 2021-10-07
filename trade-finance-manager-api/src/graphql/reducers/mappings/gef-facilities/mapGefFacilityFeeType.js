const CONSTANTS = require('../../../../constants');

const mapGefFacilityFeeType = (paymentType) => {
  if (paymentType === CONSTANTS.FACILITIES.FACILITY_FEE_TYPE_GEF.IN_ARREARS_QUARTLY) {
    return CONSTANTS.FACILITIES.FACILITY_FEE_TYPE.IN_ARREARS;
  }

  if (paymentType === CONSTANTS.FACILITIES.FACILITY_FEE_TYPE_GEF.IN_ADVANCE_QUARTERLY) {
    return CONSTANTS.FACILITIES.FACILITY_FEE_TYPE.IN_ADVANCE;
  }

  return null;
};

module.exports = mapGefFacilityFeeType;
