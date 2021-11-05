const CONSTANTS = require('../../../constants');

const getCapitalConversionFactorCode = (facility) => {
  const type = facility.facilityType || facility.facilitySnapshot.type || facility.facilitySnapshot.facilityType;

  switch (type) {
    case CONSTANTS.FACILITY.FACILITY_TYPE.BOND:
      return '1';

    case CONSTANTS.FACILITY.FACILITY_TYPE.LOAN:
      return '5';

    case CONSTANTS.FACILITY.FACILITY_TYPE.CASH:
      return '8';

    case CONSTANTS.FACILITY.FACILITY_TYPE.CONTINGENT:
      return '9';

    default:
      return '';
  }
};

module.exports = getCapitalConversionFactorCode;
