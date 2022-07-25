const api = require('../../../../v1/api');
const { formattedNumber } = require('../../../../utils/number');
const { amendmentChangeValueExportCurrency, latestAmendmentValueAccepted } = require('../../../helpers/amendment.helpers');

// maps facility value (in original currency) and checks if amendment change on that value
const mapFacilityValueExportCurrency = async (facility) => {
  if (facility) {
    const { _id, facilitySnapshot } = facility;

    const { currency, value } = facilitySnapshot;

    // checks if completed amendment which is accepted
    const latestCompletedAmendment = await api.getLatestCompletedAmendment(_id);

    if (latestCompletedAmendment?.amendmentId && latestCompletedAmendment?.value && latestAmendmentValueAccepted(latestCompletedAmendment)) {
      // returns the new value from amendment if completed and accepted by bank and UKEF
      return amendmentChangeValueExportCurrency(latestCompletedAmendment);
    }
    const formattedFacilityValue = formattedNumber(value);

    // returns original value from facility
    return `${currency.id} ${formattedFacilityValue}`;
  }
  return null;
};

module.exports = mapFacilityValueExportCurrency;
