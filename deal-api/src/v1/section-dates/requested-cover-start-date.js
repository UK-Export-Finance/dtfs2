const moment = require('moment');
const { hasValue } = require('../../utils/string');

exports.formattedTimestamp = (timestamp) => {
  const utc = moment(parseInt(timestamp, 10));
  const dt = moment(utc);
  return moment(dt).isValid() ? dt.format() : '';
};

exports.createTimestampFromSubmittedValues = (submittedValues, fieldName) => {
  const day = submittedValues[`${fieldName}-day`];
  const month = submittedValues[`${fieldName}-month`];
  const year = submittedValues[`${fieldName}-year`];

  const momentDate = moment().set({
    date: Number(day),
    month: Number(month) - 1, // months are zero indexed
    year: Number(year),
  });

  return moment(momentDate).utc().valueOf().toString();
};

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
  // delete these and use UTC timestamp in a single requestedCoverStartDate property.
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
