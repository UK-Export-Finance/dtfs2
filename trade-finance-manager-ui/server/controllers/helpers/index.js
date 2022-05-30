const { showAmendmentButton, userCanEditLeadUnderwriter, userCanEditManagersDecision, userCanEditBankDecision } = require('./amendments.helper');
const { generateHeadingText } = require('./generateHeadingText.helper');
const { mapDecisionObject, mapDecisionValue } = require('./mapDecisionObject.helper');
const { getGroup, getTask } = require('./tasks.helper');
const { validateCommentField, validateSubmittedValues } = require('./validateSubmittedValues.helper');

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
};
