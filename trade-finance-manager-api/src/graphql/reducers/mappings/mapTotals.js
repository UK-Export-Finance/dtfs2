const { formattedNumber } = require('../../../utils/number');
const { stripCommas } = require('../../../utils/string');

const mapTotals = (facilities) => {
  const totals = {};

  // DTFS-2727
  // for initial dev, only return facilityValue if currency is GBP.
  // TODO: until we figure out which API to use for conversion from non-GBP.
  const gbpFacilities = facilities.filter((f) => f.currency.id === 'GBP');

  const facilitiesValue = gbpFacilities.map(({ facilityValue }) => Number(facilityValue));

  if (facilitiesValue.length) {
    const formattedFacilitiesValue = formattedNumber(facilitiesValue.reduce((a, b) => a + b));

    totals.facilitiesValueInGBP = `GBP ${formattedFacilitiesValue}`;
  }

  const facilitiesUkefExposure = facilities.map(({ ukefExposure }) => Number(stripCommas(ukefExposure)));

  if (facilitiesUkefExposure.length) {
    const formattedUkefExposure = formattedNumber(facilitiesUkefExposure.reduce((a, b) => a + b));
    totals.facilitiesUkefExposure = `GBP ${formattedUkefExposure}`;
  }

  return totals;
};

module.exports = mapTotals;
