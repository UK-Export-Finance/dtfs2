const facilityValue = require('../fields/facility-value');

module.exports = (loan, errorList) => {
  let newErrorList = { ...errorList };

  newErrorList = facilityValue(loan, 'Loan facility value', newErrorList);

  return newErrorList;
};
