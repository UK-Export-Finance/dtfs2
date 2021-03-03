const { formattedNumber } = require('../../../../utils/number');

const mapFacilityValue = (currency, facilityValue, facilityTfm) => {
  const { facilityValueInGBP } = facilityTfm;

  if (currency.id !== 'GBP') {
    return `GBP ${formattedNumber(facilityValueInGBP)}`;
  }

  return `${currency.id} ${facilityValue}`;
};

module.exports = mapFacilityValue;
