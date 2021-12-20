const { formattedNumber } = require('../../../../utils/number');

const mapFacilityValue = (currencyId, value, facilityTfm) => {
  const { facilityValueInGBP } = facilityTfm;

  if (currencyId !== 'GBP') {
    return `GBP ${formattedNumber(facilityValueInGBP)}`;
  }

  return `${currencyId} ${value}`;
};

module.exports = mapFacilityValue;
