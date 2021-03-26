const { formattedNumber } = require('../../../../utils/number');

const mapTotals = (tfmFacilities) => {
  const totals = {};

  // total value of all facilities
  const facilities = tfmFacilities.map(({ tfm }) => tfm);

  const facilitiesValue = facilities.map(({ facilityValueInGBP }) => Number(facilityValueInGBP));

  const formattedFacilitiesValue = formattedNumber(facilitiesValue.reduce((a, b) => a + b));

  totals.facilitiesValueInGBP = `GBP ${formattedFacilitiesValue}`;


  // total of all facilities ukef exposure
  const facilitiesUkefExposure = facilities.map((facility) =>
    facility.ukefExposure);

  const formattedUkefExposure = formattedNumber(facilitiesUkefExposure.reduce((a, b) => a + b));

  totals.facilitiesUkefExposure = `GBP ${formattedUkefExposure}`;

  return totals;
};

module.exports = mapTotals;
