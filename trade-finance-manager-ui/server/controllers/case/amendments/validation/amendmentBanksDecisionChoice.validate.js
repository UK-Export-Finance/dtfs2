const { validationErrorHandler } = require('../../../../helpers/validationErrorHandler.helper');

/**
 *
 * @param {String} decision
 * @returns {Object}
 * Validation function to check if decision has been selected on amendment banks decision
 * if decision blank, then produces error and returns
 * if decision, then returns blank error object
 */
const amendmentBankDecisionValidation = (decision) => {
  if (!decision) {
    const amendmentBankDecisionValidationErrors = [];

    amendmentBankDecisionValidationErrors.push({
      errRef: 'banksDecision',
      errMsg: 'Select if the bank wants to proceed or withdraw',
    });

    const errorsObject = {
      errors: validationErrorHandler(amendmentBankDecisionValidationErrors),
    };

    return { errorsObject, amendmentBankDecisionValidationErrors };
  }

  return { errorsObject: {}, amendmentBankDecisionValidationErrors: [] };
};

module.exports = { amendmentBankDecisionValidation };
