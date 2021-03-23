const { formattedNumber } = require('../../../utils/number');
const { stripCommas } = require('../../../utils/string');

const mapTotals = (tfmFacilities) => {
  const totals = {};
  // DTFS-2727, DTFS2-2730
  // for initial dev, only calculate totals if all facilities is currency is GBP.
  // TODO: until we figure out which API to use for conversion from non-GBP.
  const facilities = tfmFacilities.map(({ facilitySnapshot }) => facilitySnapshot);

  const gbpFacilities = facilities.filter((f) => f.currency.id === 'GBP');

  if (facilities.length === gbpFacilities.length) {
    const facilitiesValue = gbpFacilities.map(({ facilityValue }) => Number(facilityValue));

    const formattedFacilitiesValue = formattedNumber(facilitiesValue.reduce((a, b) => a + b));

    totals.facilitiesValueInGBP = `GBP ${formattedFacilitiesValue}`;

    const facilitiesUkefExposure = facilities.map((facility) => {
      if (facility.ukefExposure) {
        return Number(stripCommas(facility.ukefExposure));
      }
      return null;
    });

    const formattedUkefExposure = formattedNumber(facilitiesUkefExposure.reduce((a, b) => a + b));

    totals.facilitiesUkefExposure = `GBP ${formattedUkefExposure}`;
  }

  return totals;
};

module.exports = mapTotals;
