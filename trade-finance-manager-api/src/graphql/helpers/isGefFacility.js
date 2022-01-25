const CONSTANTS = require('../../constants');

const isGefFacility = (type) =>
  type === CONSTANTS.FACILITIES.FACILITY_TYPE.CASH
  || type === CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT;

module.exports = isGefFacility;
