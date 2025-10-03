const { to2Decimals } = require('../../helpers/currency');
const { formatDate } = require('../../helpers/date');

/**
 * Maps an amendment object to a facility guarantee record.
 *
 * @param {object} amendment - The amendment object containing the changes.
 * @param {number} amendment.amount - The amended amount for the guarantee.
 * @param {string} amendment.coverEndDate - The amended cover end date for the guarantee.
 * @returns {object} The amended facility guarantee record.
 */
const facilityGuaranteeAmend = (amendment) => {
  try {
    // Default guarantee record
    let record = {};
    const { amount, coverEndDate } = amendment;

    // 1. UKEF Exposure
    if (amount) {
      record = {
        guaranteedLimit: to2Decimals(amount),
      };
    }

    // 2. Cover end date
    if (coverEndDate) {
      record = {
        ...record,
        expirationDate: formatDate(coverEndDate),
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
