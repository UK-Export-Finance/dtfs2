const { to2Decimals } = require('../../helpers/currency');
/**
 * @param {object} amendment
 * @param {number | string} amendment.amount - Amount as number or string
 * @param {object} amendment.facilityGuaranteeDates
 * @param {string} amendment.facilityGuaranteeDates.guaranteeExpiryDate - Date only string in 'YYYY-MM-DD' format
 * @returns {object} - Amended facility guarantee record or empty object if there is an error
 */
const facilityCovenantAmend = (amendment) => {
  try {
    const { amount, facilityGuaranteeDates } = amendment;
    const record = {};

    if (!amount && !facilityGuaranteeDates && !facilityGuaranteeDates.guaranteeExpiryDate) {
      throw new Error('Either amount or facilityGuaranteeDates.guaranteeExpiryDate is required.');
    }

    if (amount) {
      record.targetAmount = to2Decimals(amount);
    }

    if (facilityGuaranteeDates.guaranteeExpiryDate) {
      record.expirationDate = facilityGuaranteeDates.guaranteeExpiryDate;
    }

    // Return amended FCR
    return record;
  } catch (error) {
    console.error('Unable to map facility covenant record %o', error);
    return {};
  }
};

module.exports = facilityCovenantAmend;
