const { hasValue } = require('../../../../utils/string');
const bankReferenceNumber = require('./bank-reference-number');
const requestedCoverStartDateRules = require('../../fields/requested-cover-start-date');
const coverEndDate = require('../../fields/cover-end-date');
const coverDates = require('../../fields/cover-dates');
const disbursementAmount = require('../disbursement-amount');

module.exports = (loan, errorList, requestedCoverStartDateTimestamp) => {
  let newErrorList = { ...errorList };
  const {
    facilityStage,
  } = loan;

  if (hasValue(facilityStage)
    && facilityStage === 'Unconditional') {
    newErrorList = bankReferenceNumber(loan, newErrorList);
    newErrorList = requestedCoverStartDateRules(loan, newErrorList, requestedCoverStartDateTimestamp);
    newErrorList = coverEndDate(loan, newErrorList);
    newErrorList = coverDates(loan, newErrorList);
    newErrorList = disbursementAmount(loan, newErrorList);
  }

  return newErrorList;
};
