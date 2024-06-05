const { CURRENCY } = require('@ukef/dtfs2-common');
const { formattedNumber } = require('../../../../utils/number');
const { calculateNewFacilityValue, findLatestCompletedAmendment } = require('../../helpers/amendment.helpers');

const mapFacilityValue = (currencyId, value, facility) => {
  if (facility) {
    const { tfm: facilityTfm } = facility;

    // if there are amendments in facility
    if (facility?.amendments?.length) {
      const { exchangeRate } = facilityTfm;
      const latestAmendmentTFM = findLatestCompletedAmendment(facility.amendments);
      // if latest completed amendment contains value
      if (latestAmendmentTFM?.value) {
        const valueInGBP = calculateNewFacilityValue(exchangeRate, latestAmendmentTFM.value);
        return `${CURRENCY.GBP} ${formattedNumber(valueInGBP)}`;
      }
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
