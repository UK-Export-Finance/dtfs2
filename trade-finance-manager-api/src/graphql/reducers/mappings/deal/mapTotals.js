const { formattedNumber } = require('../../../../utils/number');

const mapTotals = (facilities) => {
  const totals = {};

  // total value of all facilities
  const facilitiesValue = facilities.map((facility) => {
    if (facility.tfm.facilityValueInGBP) {
      return Number(facility.tfm.facilityValueInGBP);
    }
    return Number(facility.facilityValue);
  });

  const formattedFacilitiesValue = formattedNumber(facilitiesValue.reduce((a, b) => a + b));

  totals.facilitiesValueInGBP = `GBP ${formattedFacilitiesValue}`;


  // total of all facilities ukef exposure
  const facilitiesUkefExposure = facilities.map((facility) =>
    facility.tfm.ukefExposure);

  const formattedUkefExposure = formattedNumber(facilitiesUkefExposure.reduce((a, b) => a + b));

  totals.facilitiesUkefExposure = `GBP ${formattedUkefExposure}`;

  return totals;
};

module.exports = mapTotals;
