const { hasValue } = require('../../../utils/string.util');
const ukefGuaranteeInMonths = require('../fields/ukef-guarantee-in-months');

module.exports = (bond, errorList) => {
  let newErrorList = { ...errorList };
  const { facilityStage } = bond;

  const isUnissued = (hasValue(facilityStage) && facilityStage === 'Unissued');

  if (isUnissued) {
    newErrorList = ukefGuaranteeInMonths(bond, newErrorList);
  }

  return newErrorList;
};
