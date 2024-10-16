const { to2Decimals } = require('../../helpers/currency');

/**
 * @typedef {number} GuaranteedLimit The guaranteed limit.
 */

/**
 * @typedef {string} ExpirationDate The expiration date
 */

/**
 * @typedef { {} | {GuaranteedLimit} | {ExpirationDate} | {GuaranteedLimit, ExpirationDate} } MappedFacilityGuaranteeAmendment
 */

/**
 * Maps a facility guarantee amendment from DTFS to the acceptable TFS format.
 * @param {Object} amendment - The amendment details.
 * @param {number|string} amendment.amount - The amount to be amended, can be a number or a string. It is required if guaranteeExpiryDate is not provided.
 * @param {Object} amendment.facilityGuaranteeDates - The dates related to the facility guarantee.
 * @param {string} amendment.facilityGuaranteeDates.guaranteeExpiryDate - The expiry date of the guarantee in 'YYYY-MM-DD' format. It is required if amount is not provided.
 * @returns { MappedFacilityGuaranteeAmendment } - The amended facility guarantee record, or an empty object if there is an error.
 */
const facilityGuaranteeAmend = (amendment) => {
  try {
    const { amount, facilityGuaranteeDates } = amendment;
    let record = {};

    if (!amount && !facilityGuaranteeDates?.guaranteeExpiryDate) {
      throw new Error('Invalid argument set provided');
    }

    if (amount) {
      record = {
        ...record,
        guaranteedLimit: to2Decimals(amount),
      };
    }

    if (facilityGuaranteeDates?.guaranteeExpiryDate) {
      record = {
        ...record,
        expirationDate: facilityGuaranteeDates.guaranteeExpiryDate,
      };
    }

    // Return amended FGR
    return record;
  } catch (error) {
    console.error('Unable to map facility guarantee amendment. %o', error);
    return {};
  }
};

module.exports = facilityGuaranteeAmend;
