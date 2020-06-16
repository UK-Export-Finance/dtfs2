const { hasValue } = require('../../../../utils/string');
const bankReferenceNumber = require('./bank-reference-number');
const requestedCoverStartDate = require('../../fields/requested-cover-start-date');
const coverEndDate = require('../../fields/cover-end-date');
const coverDates = require('../../fields/cover-dates');
const disbursementAmount = require('./disbursement-amount');

module.exports = (loan, errorList) => {
  let newErrorList = { ...errorList };
  const {
    facilityStage,
  } = loan;

  if (hasValue(facilityStage)
    && facilityStage === 'Unconditional') {
    newErrorList = bankReferenceNumber(loan, newErrorList);
    newErrorList = requestedCoverStartDate(loan, newErrorList);
    newErrorList = coverEndDate(loan, newErrorList);
    newErrorList = coverDates(loan, newErrorList);
    newErrorList = disbursementAmount(loan, newErrorList);
  }

  return newErrorList;
};
