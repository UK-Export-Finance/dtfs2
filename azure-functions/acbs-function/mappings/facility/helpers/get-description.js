const CONSTANTS = require('../../../constants');
const getExposurePeriod = require('./get-exposure-period');

/*
  "description": FacilityType + Workflow Exposure Period i.e. EWCS 15 Months,
*/
const getDescription = (facility) => {
  const exposurePeriod = getExposurePeriod(facility);

  switch (facility.facilitySnapshot.facilityType) {
    case CONSTANTS.FACILITY.FACILITY_TYPE.BOND:
      return `BSS ${exposurePeriod} Months`;

    case CONSTANTS.FACILITY.FACILITY_TYPE.LOAN:
      return `EWCS ${exposurePeriod} Months`;

    default:
      return '';
  }
};

module.exports = getDescription;
