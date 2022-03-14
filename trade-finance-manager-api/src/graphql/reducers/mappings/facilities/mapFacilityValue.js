const { formattedNumber } = require('../../../../utils/number');

const mapFacilityValue = (currencyId, value, facilityTfm) => {
  const { valueInGBP } = facilityTfm;

  if (currencyId !== 'GBP') {
    return `GBP ${formattedNumber(valueInGBP)}`;
  }

  return `${currencyId} ${value}`;
};

module.exports = mapFacilityValue;
