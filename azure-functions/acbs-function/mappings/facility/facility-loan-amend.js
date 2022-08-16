const CONSTANTS = require('../../constants');
const { formatDate, now } = require('../../helpers/date');
const helpers = require('./helpers');

const { FACILITY } = CONSTANTS;

const facilityLoanAmend = (amendments, facility, facilityMasterRecord) => {
  try {
    // Default facility loan record
    let record = { portfolioIdentifier: FACILITY.PORTFOLIO.E1 };
    // De-structure
    const { amendment } = amendments;
    const { facilitySnapshot } = facility;

    if (amendment && facilitySnapshot) {
      // De-structure
      const { amount, coverEndDate } = amendment;
      const { type, feeType } = facilitySnapshot;

      // 1. UKEF Exposure
      if (amount) {
        // 1.1. Amend amount, if facility type is `Bond`.
        if (type === CONSTANTS.FACILITY.FACILITY_TYPE.BOND) {
          record = {
            ...record,
            effectiveDate: now(),
            amountAmendment: helpers.getLoanAmountDifference(amount, facilityMasterRecord),
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
  } catch (e) {
    console.error('Unable to map facility loan record: ', { e });
    return e;
  }
};

module.exports = facilityLoanAmend;
