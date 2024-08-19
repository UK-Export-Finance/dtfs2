const { to2Decimals } = require('../../helpers/currency');

/**
 * Maps a facility covenant amendment from DTFS to the acceptable TFS format.
 *
 * @typedef {object} MappedFacilityCovenantAmendment - The mapped facility guarantee amendment.
 * @property {number=} targetAmount - The amount used to determine if the covenant is in compliance or not.
 * @property {string=} expirationDate - The expiration date of the covenant. It is called expiration date in ACBS. In 'YYYY-MM-DD' format.
 *
 *
 * @param {object} amendment - The amendment details.
 * @param {number|string=} amendment.amount - The amount to be amended, can be a number or a string. It is required if guaranteeExpiryDate is not provided.
 * @param {object=} amendment.facilityGuaranteeDates - The dates related to the facility guarantee.
 * @param {string=} amendment.facilityGuaranteeDates.guaranteeExpiryDate - The expiry date of the guarantee in 'YYYY-MM-DD' format. It is required if amount is not provided.
 * @returns {MappedFacilityCovenantAmendment | {} } - The amended facility guarantee record, or an empty object if there is an error.
 */
const facilityCovenantAmend = (amendment) => {
  try {
    const { amount, facilityGuaranteeDates } = amendment;
    const record = {};

    if (!amount && !facilityGuaranteeDates?.guaranteeExpiryDate) {
      throw new Error('Invalid argument set provided');
    }

    if (amount) {
      record.targetAmount = to2Decimals(amount);
    }

    if (facilityGuaranteeDates?.guaranteeExpiryDate) {
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
