const CONSTANTS = require('../../constants');
const { formatDate, now } = require('../../helpers/date');
const helpers = require('./helpers');

const { FACILITY } = CONSTANTS;

/**
 * Maps amendment details to a facility loan amendment record.
 *
 * @param {object} amendment - The amendment details, possibly containing `amount` and `coverEndDate`.
 * @param {object} facility - The facility object, expected to have a `facilitySnapshot` property.
 * @param {object} facilityMasterRecord - The master record for the facility, used for calculating amount differences.
 * @returns {object} The amended facility loan record with updated fields based on the amendment.
 */
const facilityLoanAmend = (amendment, facility, facilityMasterRecord) => {
  try {
    // Default facility loan record
    let record = {};
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

    // Return amended FLR
    return record;
  } catch (error) {
    console.error('Unable to map facility loan amendment record %o', error);
    return {};
  }
};

module.exports = facilityLoanAmend;
