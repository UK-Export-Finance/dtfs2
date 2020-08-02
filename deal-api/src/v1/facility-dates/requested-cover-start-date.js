const moment = require('moment');
const { hasValue } = require('../../utils/string');

const getRequestedCoverStartDateValues = (loan) => {
  const {
    'requestedCoverStartDate-day': requestedCoverStartDateDay,
    'requestedCoverStartDate-month': requestedCoverStartDateMonth,
    'requestedCoverStartDate-year': requestedCoverStartDateYear,
  } = loan;

  return {
    requestedCoverStartDateDay,
    requestedCoverStartDateMonth,
    requestedCoverStartDateYear,
  };
};

const hasAllRequestedCoverStartDateValues = (loan) => {
  const {
    requestedCoverStartDateDay,
    requestedCoverStartDateMonth,
    requestedCoverStartDateYear,
  } = getRequestedCoverStartDateValues(loan);

  const hasRequestedCoverStartDate = (hasValue(requestedCoverStartDateDay)
    && hasValue(requestedCoverStartDateMonth)
    && hasValue(requestedCoverStartDateYear));

  if (hasRequestedCoverStartDate) {
    return true;
  }

  return false;
};

exports.hasAllRequestedCoverStartDateValues = hasAllRequestedCoverStartDateValues;

exports.updateRequestedCoverStartDate = (loan) => {
  // if we have all requestedCoverStartDate fields (day, month and year)
  // generate UTC timestamp in a single requestedCoverStartDate property.
  const modifiedLoan = loan;

  if (hasAllRequestedCoverStartDateValues(loan)) {
    const {
      requestedCoverStartDateDay,
      requestedCoverStartDateMonth,
      requestedCoverStartDateYear,
    } = getRequestedCoverStartDateValues(loan);

    const momentDate = moment().set({
      date: Number(requestedCoverStartDateDay),
      month: Number(requestedCoverStartDateMonth) - 1, // months are zero indexed
      year: Number(requestedCoverStartDateYear),
    });
    modifiedLoan.requestedCoverStartDate = moment(momentDate).utc().valueOf().toString();
  }
  return modifiedLoan;
};
