const { validationErrorHandler } = require('../../../../helpers/validationErrorHandler.helper');
const { UNDERWRITER_MANAGER_DECISIONS: { APPROVED_WITH_CONDITIONS, DECLINED } } = require('../../../../constants/decisions.constant');

const amendmentManagersDecisionConditionsValidation = (conditionsBody, amendment) => {
  const { ukefDecisionConditions, ukefDecisionDeclined } = conditionsBody;
  const { coverEndDate, value } = amendment.ukefDecision;

  const amendmentManagersDecisionConditionsErrors = [];

  if (coverEndDate === APPROVED_WITH_CONDITIONS || value === APPROVED_WITH_CONDITIONS) {
    if (!ukefDecisionConditions || ukefDecisionConditions === '') {
      amendmentManagersDecisionConditionsErrors.push({
        errRef: 'ukefDecisionConditions',
        errMsg: 'Enter the conditions for the approval',
      });
    }
  }

  if (coverEndDate === DECLINED || value === DECLINED) {
    if (!ukefDecisionDeclined || ukefDecisionDeclined === '') {
      amendmentManagersDecisionConditionsErrors.push({
        errRef: 'ukefDecisionDeclined',
        errMsg: 'Enter the reasons for declining the change',
      });
    }
  }

  const errorsObject = {
    errors: validationErrorHandler(amendmentManagersDecisionConditionsErrors),
  };

  return { errorsObject, amendmentManagersDecisionConditionsErrors };
};

module.exports = { amendmentManagersDecisionConditionsValidation };
