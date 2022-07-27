const CONSTANTS = require('../../constants');
const { formatDate } = require('../../helpers/date');
const helpers = require('./helpers');

const facilityLoanAmend = (amendments, facility) => {
  try {
    let record = {
      portfolioIdentifier: CONSTANTS.FACILITY.PORTFOLIO.E1,
    };
    const { amendment } = amendments;

    if (amendment) {
      const { amount, coverEndDate } = amendment;

      // UKEF Exposure
      if (amount) {
        // Only BSS (Bond) facility types are subjected to loan amount amendment.
        if (facilityMasterRecord.productTypeId === CONSTANTS.FACILITY.FACILITY_TYPE_CODE.BSS) {
          record = {
            ...record,
            amount: helpers.getMaximumLiability(amendments),
          };
        }
      }

      // Cover end date
      if (coverEndDate) {
        record = {
          ...record,
          expiryDate: formatDate(coverEndDate),
        };
        // Amend `nextDueDate` if fee type is `At Maturity`
        if (facilityMasterRecord) {
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
