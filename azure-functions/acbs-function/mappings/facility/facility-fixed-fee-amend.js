const CONSTANTS = require('../../constants');
const { now } = require('../../helpers/date');

const { FACILITY } = CONSTANTS;

/**
 * Maps the amendments for a facility fixed fee record in the ACBS system.
 *
 * This function performs the following operations:
 * 1. Validates the input amendments.
 * 2. Constructs the fixed fee amendment records with the necessary fields.
 * 3. Adds records for different lender types.
 *
 * @param {Object} amendments - The amendments to be applied to the facility fixed fee record.
 * @param {Object} amendments.amendment - The specific amendment details.
 * @param {number} amendments.amendment.amount - The amended amount for the facility fixed fee.
 * @returns {Array} - An array of facility fixed fee amendment records, each containing the party identifier, period, effective date, amount amendment, and lender type code.
 * @throws {Error} - Logs the error and returns an empty array if any error occurs during the mapping process.
 */
const facilityFixedFeeAmend = (amendments) => {
  try {
    const records = [];
    const { amendment } = amendments;
    const { amount } = amendment;

    // 1. UKEF Exposure
    if (amount) {
      const effectiveDate = now();
      const record = {
        partyIdentifier: '',
        period: '01',
        effectiveDate,
        amountAmendment: amount,
      };

      // 1.1. Lender type `100`
      records.push({
        ...record,
        lenderTypeCode: FACILITY.LENDER_TYPE.TYPE1,
      });

      // 1.2. Lender type `500`
      records.push({
        ...record,
        lenderTypeCode: FACILITY.LENDER_TYPE.TYPE5,
      });
    }

    return records;
  } catch (error) {
    console.error('Unable to map facility fixed fee amendment record %o', error);
    return {};
  }
};

module.exports = facilityFixedFeeAmend;
