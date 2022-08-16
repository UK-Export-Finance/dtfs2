const { formattedNumber } = require('../../../../utils/number');
const { amendmentChangeValueExportCurrency, findLatestCompletedAmendment } = require('../../../helpers/amendment.helpers');

// maps facility value (in original currency) and checks if amendment change on that value
const mapFacilityValueExportCurrency = (facility) => {
  if (facility) {
    const { facilitySnapshot } = facility;

    const { currency, value } = facilitySnapshot;

    if (facility?.amendments?.length > 0) {
      const latestAmendmentTFM = findLatestCompletedAmendment(facility.amendments);

      // returns the new value from amendment if completed and accepted by bank and UKEF
      if (latestAmendmentTFM?.value) {
        return amendmentChangeValueExportCurrency(latestAmendmentTFM.value);
      }
    }
    const formattedFacilityValue = formattedNumber(value);

    // returns original value from facility
    return `${currency.id} ${formattedFacilityValue}`;
  }
  return null;
};

module.exports = mapFacilityValueExportCurrency;
