const CONSTANTS = require('../../../constants');
const getExposurePeriod = require('./get-exposure-period');

/*
  "description": FacilityType + Workflow Exposure Period i.e. EWCS 15 Months,
*/
const getDescription = (facility, dealType) => {
  const exposurePeriod = getExposurePeriod(facility, dealType);

  if (dealType === CONSTANTS.PRODUCT.TYPE.GEF) {
    return `MGA GEF ${exposurePeriod} Months`;
  }

  switch (facility.facilitySnapshot.type) {
    case CONSTANTS.FACILITY.FACILITY_TYPE.BOND:
      return `BSS ${exposurePeriod} Months`;

    case CONSTANTS.FACILITY.FACILITY_TYPE.LOAN:
      return `EWCS ${exposurePeriod} Months`;

    default:
      return '';
  }
};

module.exports = getDescription;
