const Joi = require('joi');

const { showAmendmentButton, userCanEditLeadUnderwriter, userCanEditManagersDecision, userCanEditBankDecision } = require('./amendments.helper');
const { generateHeadingText } = require('./generateHeadingText.helper');
const { mapDecisionObject, mapDecisionValue } = require('./mapDecisionObject.helper');
const { getGroup, getTask } = require('./tasks.helper');
const { validateCommentField, validateSubmittedValues } = require('./validateSubmittedValues.helper');

/**
 * function to validate probability of default
 * checks if between 0.01 and 14.09
 * checks if no more than 2 decimal places
 * precision(2) = 4 decimal places
 * min(0.01) = minimum value of 0.01
 * max(14.09) = max value of 14.09
 * if any errors, then returns false
 * else true
 */
const probabilityOfDefaultValidation = ((probabilityofDefaultPercentage) => {
  const schema = Joi.number().precision(2).strict().min(0.01)
    .max(14.09)
    .required()
    .strict();
  // convert to number as stored as string
  const validation = schema.validate(Number(probabilityofDefaultPercentage));

  // error object does not exist if no errors in validation
  if (validation.error) {
    return false;
  }

  return true;
});

module.exports = {
  showAmendmentButton,
  userCanEditLeadUnderwriter,
  userCanEditManagersDecision,
  userCanEditBankDecision,
  generateHeadingText,
  mapDecisionObject,
  mapDecisionValue,
  getGroup,
  getTask,
  validateCommentField,
  validateSubmittedValues,
  probabilityOfDefaultValidation
};
