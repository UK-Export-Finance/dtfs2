const { hasValue } = require('#helpers/string');
const { userFullName } = require('#server-helpers/user');
const CONSTANTS = require('#constants');

const mapDecisionValue = (decision) => {
  if (decision === CONSTANTS.DEAL.UNDERWRITING_MANAGERS_DECISION_INPUT.APPROVE_WITHOUT_CONDITIONS) {
    return CONSTANTS.DEAL.DEAL_STAGE.APPROVED_WITHOUT_CONDITIONS;
  }

  if (decision === CONSTANTS.DEAL.UNDERWRITING_MANAGERS_DECISION_INPUT.APPROVE_WITH_CONDITIONS) {
    return CONSTANTS.DEAL.DEAL_STAGE.UKEF_APPROVED_WITH_CONDITIONS;
  }

  if (decision === CONSTANTS.DEAL.UNDERWRITING_MANAGERS_DECISION_INPUT.DECLINED) {
    return CONSTANTS.DEAL.DEAL_STAGE.DECLINED;
  }

  return null;
};

const mapDecisionObject = (submittedValues, user) => {
  const { decision, approveWithConditionsComments, declineComments, internalComments } = submittedValues;

  const mapped = { internalComments, userFullName: userFullName(user) };

  if (decision === CONSTANTS.DEAL.UNDERWRITING_MANAGERS_DECISION_INPUT.APPROVE_WITH_CONDITIONS && hasValue(approveWithConditionsComments)) {
    mapped.comments = approveWithConditionsComments;
  } else if (decision === CONSTANTS.DEAL.UNDERWRITING_MANAGERS_DECISION_INPUT.DECLINED && hasValue(declineComments)) {
    mapped.comments = declineComments;
  }

  mapped.decision = mapDecisionValue(decision);

  return mapped;
};

module.exports = {
  mapDecisionObject,
  mapDecisionValue,
};
