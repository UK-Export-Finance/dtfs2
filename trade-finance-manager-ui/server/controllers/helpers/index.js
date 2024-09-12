const {
  showAmendmentButton,
  userCanEditManagersDecision,
  userCanEditBankDecision,
  ukefDecisionRejected,
  validateUkefDecision,
} = require('./amendments.helper');
const { generateHeadingText } = require('./generateHeadingText.helper');
const { mapDecisionObject, mapDecisionValue } = require('./mapDecisionObject.helper');
const { getGroup, getTask } = require('./tasks.helper');
const { validateCommentField, validateSubmittedValues } = require('./validateSubmittedValues.helper');
const { probabilityOfDefaultValidation } = require('./probabilityOfDefault.validate');
const { overrideDealsIfAmendmentsInProgress } = require('./overrideDealsIfAmendmentsInProgress.helper');
const { overrideFacilitiesIfAmendmentsInProgress } = require('./overrideFacilitiesIfAmendmentsInProgress.helper');
const { renderDealsOrFacilitiesPage, queryDealsOrFacilities } = require('./dealsAndFacilities.helper');
const { dealCancellationEnabled } = require('./deal-cancellation-enabled.helper');

module.exports = {
  showAmendmentButton,
  dealCancellationEnabled,
  userCanEditManagersDecision,
  userCanEditBankDecision,
  generateHeadingText,
  mapDecisionObject,
  mapDecisionValue,
  getGroup,
  getTask,
  validateCommentField,
  validateSubmittedValues,
  ukefDecisionRejected,
  validateUkefDecision,
  probabilityOfDefaultValidation,
  overrideDealsIfAmendmentsInProgress,
  overrideFacilitiesIfAmendmentsInProgress,
  renderDealsOrFacilitiesPage,
  queryDealsOrFacilities,
};
