const CONSTANTS = require('../../../constants');

const getInterestOrFeeRate = (facilitySnapshot, dealType) => {
  if (dealType === CONSTANTS.PRODUCT.TYPE.GEF) {
    return facilitySnapshot.interestPercentage;
  }
  switch (facilitySnapshot.type) {
    case CONSTANTS.FACILITY.FACILITY_TYPE.BOND:
      return Number(facilitySnapshot.riskMarginFee);

    case CONSTANTS.FACILITY.FACILITY_TYPE.LOAN:
      return Number(facilitySnapshot.interestMarginFee);

    default:
      return '';
  }
};

module.exports = getInterestOrFeeRate;
