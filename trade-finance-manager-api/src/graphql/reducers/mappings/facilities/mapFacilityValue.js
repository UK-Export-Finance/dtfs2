const { formattedNumber } = require('../../../../utils/number');
const api = require('../../../../v1/api');
const { CURRENCY } = require('../../../../constants/currency.constant');
const { calculateNewFacilityValue } = require('../../../helpers/amendment.helpers');

const mapFacilityValue = async (currencyId, value, facility) => {
  if (facility) {
    const {
      _id,
      tfm: facilityTfm,
    } = facility;

    const latestCompletedAmendmentValue = await api.getLatestCompletedValueAmendment(_id);

    if (latestCompletedAmendmentValue?.value) {
      const { exchangeRate } = facilityTfm;

      const valueInGBP = calculateNewFacilityValue(exchangeRate, latestCompletedAmendmentValue);
      return `${CURRENCY.GBP} ${formattedNumber(valueInGBP)}`;
    }

    if (facilityTfm?.facilityValueInGBP) {
      const { facilityValueInGBP } = facilityTfm;

      if (currencyId !== CURRENCY.GBP) {
        return `${CURRENCY.GBP} ${formattedNumber(facilityValueInGBP)}`;
      }
    }
  }

  return `${currencyId} ${formattedNumber(value)}`;
};

module.exports = mapFacilityValue;
