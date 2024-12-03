const { validationErrorHandler } = require('../../../../helpers/validationErrorHandler.helper');
const { UNDERWRITER_MANAGER_DECISIONS } = require('../../../../constants/decisions.constant');

const amendmentUnderwriterManagerDecisionValidation = (decision, decisionType) => {
  if (!decision) {
    const amendmentUnderwriterManagerValidationErrors = [];
    const decisionsArray = [
      UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS,
      UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS,
      UNDERWRITER_MANAGER_DECISIONS.DECLINED,
    ];

    if (decisionType === 'coverEndDate') {
      if (!decisionsArray.includes(decision)) {
        amendmentUnderwriterManagerValidationErrors.push({
          errRef: 'underwriterManagerDecisionCoverEndDate',
          errMsg: 'Select your decision for the cover end date',
        });
      }
    } else if (decisionType === 'value') {
      if (!decisionsArray.includes(decision)) {
        amendmentUnderwriterManagerValidationErrors.push({
          errRef: 'underwriterManagerDecisionFacilityValue',
          errMsg: 'Select your decision for the facility value',
        });
      }
    }

    const errorsObject = {
      errors: validationErrorHandler(amendmentUnderwriterManagerValidationErrors),
    };

    return { errorsObject, amendmentUnderwriterManagerValidationErrors };
  }

  return { errorsObject: {}, amendmentUnderwriterManagerValidationErrors: [] };
};

module.exports = { amendmentUnderwriterManagerDecisionValidation };
