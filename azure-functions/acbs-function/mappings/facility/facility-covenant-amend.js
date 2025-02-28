const { to2Decimals } = require('../../helpers/currency');
const { formatDate } = require('../../helpers/date');

/**
 * Maps an amendment object to a facility covenant record.
 *
 * @param {Object} amendment - The amendment object containing the details to be mapped.
 * @param {number} amendment.amount - The amount to be set in the targetAmount field.
 * @param {string} amendment.coverEndDate - The cover end date to be formatted and set in the expirationDate field.
 * @returns {Object} The mapped facility covenant record.
 */
const facilityCovenantAmend = (amendment) => {
  try {
    // Default guarantee record
    let record = {};
    const { amount, coverEndDate } = amendment;

    if (amount) {
      record = {
        targetAmount: to2Decimals(amount),
      };
    }

    // 2. Cover end date
    if (coverEndDate) {
      record = {
        ...record,
        expirationDate: formatDate(coverEndDate),
      };
    }

    // Return amended FCR
    return record;
  } catch (error) {
    console.error('Unable to map facility covenant record %o', error);
    return {};
  }
};

module.exports = facilityCovenantAmend;
