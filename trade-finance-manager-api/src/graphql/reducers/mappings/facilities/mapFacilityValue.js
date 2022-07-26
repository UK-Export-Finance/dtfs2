const { formattedNumber } = require('../../../../utils/number');
const api = require('../../../../v1/api');
const { CURRENCY } = require('../../../../constants/currency.constant');
const { calculateNewFacilityValue, isValidCompletedValueAmendment } = require('../../../helpers/amendment.helpers');

const mapFacilityValue = async (currencyId, value, facility) => {
  if (facility) {
    const {
      _id,
      tfm: facilityTfm,
    } = facility;

    const latestCompletedAmendment = await api.getLatestCompletedAmendment(_id);

    if (isValidCompletedValueAmendment(latestCompletedAmendment)) {
      const { exchangeRate } = facilityTfm;

      const valueInGBP = calculateNewFacilityValue(exchangeRate, latestCompletedAmendment);
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
