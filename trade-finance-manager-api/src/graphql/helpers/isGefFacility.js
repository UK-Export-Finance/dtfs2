const CONSTANTS = require('../../constants');

const isGefFacility = (facilityType) =>
  facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.CASH
  || facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT;

module.exports = isGefFacility;
