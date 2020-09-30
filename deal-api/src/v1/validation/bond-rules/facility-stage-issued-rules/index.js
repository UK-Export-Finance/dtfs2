const { hasValue } = require('../../../../utils/string');
const requestedCoverStartDate = require('./requested-cover-start-date');
const coverEndDate = require('../../fields/cover-end-date');
const coverDates = require('../../fields/cover-dates');
const uniqueIdentificationNumber = require('./unique-identification-number');

module.exports = (bond, errorList, deal) => {
  let newErrorList = { ...errorList };
  const {
    facilityStage,
  } = bond;

  const isIssued = (hasValue(facilityStage) && facilityStage === 'Issued');

  if (isIssued) {
    newErrorList = requestedCoverStartDate(bond, deal, newErrorList);
    newErrorList = coverEndDate(bond, newErrorList);
    newErrorList = coverDates(bond, newErrorList);
    newErrorList = uniqueIdentificationNumber(bond, newErrorList);
  }

  return newErrorList;
};
