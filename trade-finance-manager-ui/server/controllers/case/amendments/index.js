const { getAmendmentRequestDate, postAmendmentRequestDate } = require('./amendmentRequestDate.controller');
const { getAmendmentRequestApproval, postAmendmentRequestApproval } = require('./amendmentRequestApproval.controller');
const { getAmendmentOptions, postAmendmentOptions } = require('./amendmentOptions.controller');
const { getAmendmentEffectiveDate, postAmendmentEffectiveDate } = require('./amendmentEffectiveDate.controller');
const { getAmendFacilityValue, postAmendFacilityValue } = require('./amendFacilityValue.controller');
const { getAmendCoverEndDate, postAmendCoverEndDate } = require('./amendCoverEndDate.controller');
const { getAmendmentIsUsingFacilityEndDate, postAmendmentIsUsingFacilityEndDate } = require('./amendmentIsUsingFacilityEndDate.controller');
const { getAmendmentAnswers, postAmendmentAnswers } = require('./amendmentAnswers.controller');
const { getAmendmentTask, postAmendmentTask } = require('./amendmentTasks.controller');
const { getAmendmentLeadUnderwriter, getAssignAmendmentLeadUnderwriter, postAssignAmendmentLeadUnderwriter } = require('./leadUnderwriter.controller');
const {
  getManagersConditionsAndComments,
  postManagersConditionsAndComments,
  getManagersConditionsAndCommentsSummary,
  postManagersConditionsAndCommentsSummary,
} = require('./managersConditionsAndComments.controller');
const {
  getAmendmentAddUnderwriterManagersDecisionCoverEndDate,
  postAmendmentAddUnderwriterManagersDecisionCoverEndDate,
  getAmendmentAddUnderwriterManagersFacilityValue,
  postAmendmentAddUnderwriterManagersFacilityValue,
} = require('./underwriterManagerDecision.controller');
const {
  getAmendmentBankDecisionChoice,
  postAmendmentBankDecisionChoice,
  getAmendmentBankDecisionReceivedDate,
  postAmendmentBankDecisionReceivedDate,
  getAmendmentBankDecisionEffectiveDate,
  postAmendmentBankDecisionEffectiveDate,
  getAmendmentBankDecisionAnswers,
  postAmendmentBankDecisionAnswers,
} = require('./bankDecision.controller');

module.exports = {
  getAmendmentRequestDate,
  postAmendmentRequestDate,
  getAmendmentRequestApproval,
  postAmendmentRequestApproval,
  getAmendmentOptions,
  postAmendmentOptions,
  getAmendmentEffectiveDate,
  postAmendmentEffectiveDate,
  getAmendFacilityValue,
  postAmendFacilityValue,
  getAmendCoverEndDate,
  postAmendCoverEndDate,
  getAmendmentIsUsingFacilityEndDate,
  postAmendmentIsUsingFacilityEndDate,
  getAmendmentAnswers,
  postAmendmentAnswers,
  getAmendmentLeadUnderwriter,
  getAssignAmendmentLeadUnderwriter,
  postAssignAmendmentLeadUnderwriter,
  getAmendmentAddUnderwriterManagersDecisionCoverEndDate,
  postAmendmentAddUnderwriterManagersDecisionCoverEndDate,
  getAmendmentAddUnderwriterManagersFacilityValue,
  postAmendmentAddUnderwriterManagersFacilityValue,
  getManagersConditionsAndComments,
  postManagersConditionsAndComments,
  getManagersConditionsAndCommentsSummary,
  postManagersConditionsAndCommentsSummary,
  getAmendmentBankDecisionChoice,
  postAmendmentBankDecisionChoice,
  getAmendmentBankDecisionReceivedDate,
  postAmendmentBankDecisionReceivedDate,
  getAmendmentBankDecisionEffectiveDate,
  postAmendmentBankDecisionEffectiveDate,
  getAmendmentBankDecisionAnswers,
  postAmendmentBankDecisionAnswers,
  getAmendmentTask,
  postAmendmentTask,
};
