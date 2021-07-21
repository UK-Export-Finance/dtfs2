const { formattedNumber } = require('../../../../utils/number');

const mapFacilityValue = (currencyId, facilityValue, facilityTfm) => {
  const { facilityValueInGBP } = facilityTfm;

  if (currencyId !== 'GBP') {
    return `GBP ${formattedNumber(facilityValueInGBP)}`;
  }

  return `${currencyId} ${facilityValue}`;
};

module.exports = mapFacilityValue;
