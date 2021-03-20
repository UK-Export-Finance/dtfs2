const CONSTANTS = require('../../../constants');

const getProductTypeId = (facilityType) => {
  switch (facilityType) {
    case CONSTANTS.FACILITY.FACILITY_TYPE.BOND:
      return '250';

    case CONSTANTS.FACILITY.FACILITY_TYPE.LOAN:
      return '260';

    default:
      return '';
  }
};

module.exports = getProductTypeId;
