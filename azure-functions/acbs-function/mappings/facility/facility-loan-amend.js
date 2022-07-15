/*
"amount":   ukefExposure
*/

const CONSTANTS = require('../../constants');
const { formatDate } = require('../../helpers/date');

const facilityLoanAmend = (amendments, deal) => {
  try {
    let record = {
      portfolioIdentifier: CONSTANTS.FACILITY.PORTFOLIO.E1,
    };
    const { amendment } = amendments;

    if (amendment) {
      const { amount, coverEndDate } = amendment;

      // UKEF Exposure
      if (amount) {
        console.info(deal);
        // TODO : Facility loan amount API
      }

      // Cover end date
      if (coverEndDate) {
        record = {
          ...record,
          expiryDate: formatDate(coverEndDate),
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
