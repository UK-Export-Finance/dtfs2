const { hasValue } = require('../../../utils/string');
const ukefGuaranteeInMonths = require('../fields/ukef-guarantee-in-months');

module.exports = (bond, errorList) => {
  let newErrorList = { ...errorList };
  const { bondStage } = bond;

  const isUnissued = (hasValue(bondStage) && bondStage === 'Unissued');

  if (isUnissued) {
    newErrorList = ukefGuaranteeInMonths(bond, newErrorList);
  }

  return newErrorList;
};
