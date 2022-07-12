const { hasValue } = require('../../../../utils/string');
const requestedCoverStartDate = require('./requested-cover-start-date');
const coverEndDate = require('../../fields/cover-end-date');
const coverDates = require('../../fields/cover-dates');
const name = require('./name');

module.exports = (bond, errorList, deal) => {
  let newErrorList = { ...errorList };
  const {
    facilityStage,
  } = bond;

  const isIssued = (hasValue(facilityStage) && facilityStage === 'Issued');

  if (isIssued) {
    newErrorList = requestedCoverStartDate(bond, deal, newErrorList);
    newErrorList = coverEndDate(bond, deal, newErrorList);
    newErrorList = coverDates(bond, newErrorList);
    newErrorList = name(bond, newErrorList);
  }

  return newErrorList;
};
