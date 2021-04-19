/*
 "capitalConversionFactorCode":    This field is required for GEF. Cash facility has 8, Contingent facility has 9.
*/
const CONSTANTS = require('../../../constants');

const getCapitalConversionFactorCode = (facilityType) => {
  switch (facilityType) {
    case CONSTANTS.FACILITY.FACILITY_TYPE.BOND:
      return '1';

    case CONSTANTS.FACILITY.FACILITY_TYPE.LOAN:
      return '5';

    default:
      return '';
  }
};

module.exports = getCapitalConversionFactorCode;
