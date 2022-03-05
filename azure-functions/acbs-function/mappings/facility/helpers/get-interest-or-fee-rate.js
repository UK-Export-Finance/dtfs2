const CONSTANTS = require('../../../constants');

const getInterestOrFeeRate = (facility) => {
  /**
   * Facility record update
   */
  if (facility.update.intrestOrFeeRate) {
    return facility.update.intrestOrFeeRate;
  }

  /**
   * Facility record creation
   */
  // GEF
  if (facility.facilitySnapshot.interestPercentage) {
    return facility.facilitySnapshot.interestPercentage;
  }

  // EWCS/BSS
  switch (facility.facilitySnapshot.type) {
    case CONSTANTS.FACILITY.FACILITY_TYPE.BOND:
      return Number(facility.facilitySnapshot.riskMarginFee);

    case CONSTANTS.FACILITY.FACILITY_TYPE.LOAN:
      return Number(facility.facilitySnapshot.interestMarginFee);

    default:
      return '';
  }
};

module.exports = getInterestOrFeeRate;
