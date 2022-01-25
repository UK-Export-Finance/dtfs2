const CONSTANTS = require('../../../constants');

const mapProductGroup = (type) => {
  switch (type) {
    case CONSTANTS.FACILITIES.FACILITY_TYPE.BOND:
      return CONSTANTS.FACILITIES.FACILITY_PRODUCT_GROUP.BOND;

    case CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN:
      return CONSTANTS.FACILITIES.FACILITY_PRODUCT_GROUP.LOAN;

    default:
      return null;
  }
};

module.exports = mapProductGroup;
