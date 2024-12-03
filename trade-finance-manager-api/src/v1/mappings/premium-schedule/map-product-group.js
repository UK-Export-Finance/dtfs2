const { FACILITY_TYPE } = require('@ukef/dtfs2-common');
const CONSTANTS = require('../../../constants');

const mapProductGroup = (type) => {
  switch (type) {
    case FACILITY_TYPE.BOND:
      return CONSTANTS.FACILITIES.FACILITY_PRODUCT_GROUP.BOND;

    case FACILITY_TYPE.LOAN:
      return CONSTANTS.FACILITIES.FACILITY_PRODUCT_GROUP.LOAN;

    default:
      return null;
  }
};

module.exports = mapProductGroup;
