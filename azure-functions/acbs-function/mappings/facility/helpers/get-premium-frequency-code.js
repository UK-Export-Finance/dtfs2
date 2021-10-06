const CONSTANTS = require('../../../constants');

const getPremiumFrequencyCode = (facilitySnapshot) => {
  const feeFrequency = facilitySnapshot.frequency !== undefined
    ? facilitySnapshot.frequency
    : facilitySnapshot.feeFrequency || facilitySnapshot.premiumFrequency;

  switch (feeFrequency) {
    case CONSTANTS.FACILITY.FEE_FREQUENCY.MONTHLY:
      return '3';

    case CONSTANTS.FACILITY.FEE_FREQUENCY.QUARTERLY:
      return '2';

    case CONSTANTS.FACILITY.FEE_FREQUENCY.SEMI_ANNUALLY:
      return '1';

    case CONSTANTS.FACILITY.FEE_FREQUENCY.ANNUALLY:
      return '4';

    default:
      // Default to semi-annually until ACBS can handle facilities without fee frequency
      return '1';
  }
};


module.exports = getPremiumFrequencyCode;
