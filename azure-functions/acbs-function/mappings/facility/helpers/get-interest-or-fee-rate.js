const CONSTANTS = require('../../../constants');

const getInterestOrFeeRate = ({ facilitySnapshot }) => {
  switch (facilitySnapshot.facilityType) {
    case CONSTANTS.FACILITY.FACILITY_TYPE.BOND:
      return Number(facilitySnapshot.riskMarginFee);

    case CONSTANTS.FACILITY.FACILITY_TYPE.LOAN:
      return Number(facilitySnapshot.interestMarginFee);

    default:
      return '';
  }
};

module.exports = getInterestOrFeeRate;
