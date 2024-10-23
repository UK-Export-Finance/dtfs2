const CONSTANTS = require('../../constants');
const { formatDate, now } = require('../../helpers/date');
const helpers = require('./helpers');

const { FACILITY } = CONSTANTS;

/**
 * Processes amendments to a facility loan record.
 *
 * @param {Object} amendments - The amendments to be applied.
 * @param {Object} amendments.amendment - The specific amendment details.
 * @param {number} amendments.amendment.amount - The amended amount.
 * @param {string} amendments.amendment.coverEndDate - The amended cover end date.
 * @param {Object} facility - The facility details.
 * @param {Object} facility.facilitySnapshot - The snapshot of the facility details.
 * @param {string} facility.facilitySnapshot.type - The type of the facility.
 * @param {string} facility.facilitySnapshot.feeType - The fee type of the facility.
 * @param {Object} facilityMasterRecord - The master record of the facility.
 * @returns {Object} - The amended facility loan record.
 */
const facilityLoanAmend = (amendments, facility, facilityMasterRecord) => {
  try {
    // Default facility loan record
    let record = {};
    const { amendment } = amendments;
    const { facilitySnapshot } = facility;

    if (amendment && facilitySnapshot) {
      const { amount, coverEndDate } = amendment;
      const { type, feeType } = facilitySnapshot;

      // 1. UKEF Exposure
      if (amount) {
        // 1.1. Amend amount, if facility type is not `Loan`.
        if (type !== FACILITY.FACILITY_TYPE.LOAN) {
          record = {
            ...record,
            effectiveDate: now(),
            amountAmendment: helpers.getLoanAmountDifference(amount, type, facilityMasterRecord),
          };
        }
      }

      // 2. Cover end date
      if (coverEndDate) {
        // 2.1. Amend expiry date.
        record = {
          ...record,
          expiryDate: formatDate(coverEndDate),
        };

        // 2.2. Amend `nextDueDate`, if fee type is `At Maturity`.
        if (feeType === CONSTANTS.FACILITY.FEE_TYPE.AT_MATURITY) {
          record = {
            ...record,
            nextDueDate: formatDate(coverEndDate),
          };
        }
      }
    }

    return record;
  } catch (error) {
    console.error('Unable to map facility loan amendment record %o', error);
    return {};
  }
};

module.exports = facilityLoanAmend;
