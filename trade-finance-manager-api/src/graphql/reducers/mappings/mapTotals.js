const { formattedNumber } = require('../../../utils/number');

const mapTotals = (facilities) => {
  const totals = {};

  // DTFS-2727
  // for initial dev, only return facilityValue if currency is GBP.
  // TODO: until we figure out which API to use for conversion from non-GBP.
  const gbpFacilities = facilities.filter((f) => f.currency.id === 'GBP');

  const facilitiesValueArray = gbpFacilities.map(({ facilityValue }) => Number(facilityValue));

  const formattedFacilitiesValue = formattedNumber(facilitiesValueArray.reduce((a, b) => a + b));

  return {
    facilitiesValue: `GBP ${formattedFacilitiesValue}`,
  };
};

module.exports = mapTotals;
