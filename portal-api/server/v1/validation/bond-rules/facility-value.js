const facilityValue = require('../fields/facility-value');

module.exports = (bond, errorList) => {
  let newErrorList = { ...errorList };

  newErrorList = facilityValue(bond, 'Bond value', newErrorList);

  return newErrorList;
};
