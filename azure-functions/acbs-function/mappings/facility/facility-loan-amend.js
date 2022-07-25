/*
"amount":   ukefExposure
*/

const CONSTANTS = require('../../constants');
const { formatDate } = require('../../helpers/date');
const helpers = require('./helpers');

const facilityLoanAmend = (amendments, facilityMasterRecord) => {
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
          // TODO : Re-calculate `nextDueDate`
          // nextDueDate: helpers.getNextDueDate(facility, deal.dealSnapshot.dealType),
        };
      }
    }

    return record;
  } catch (e) {
    console.error('Unable to map facility loan record: ', { e });
    return e;
  }
};

module.exports = facilityLoanAmend;
