const { hasValue } = require('../../../../utils/string');
const requestedCoverStartDate = require('./requested-cover-start-date');
const coverEndDate = require('./cover-end-date');
const coverDates = require('./cover-dates');

module.exports = (bond, errorList) => {
  let newErrorList = { ...errorList };
  const {
    bondStage,
  } = bond;

  const isIssued = (hasValue(bondStage) && bondStage === 'Issued');

  if (isIssued) {
    newErrorList = requestedCoverStartDate(bond, newErrorList);
    newErrorList = coverEndDate(bond, newErrorList);
    newErrorList = coverDates(bond, newErrorList);
  }

  return newErrorList;
};
