const SUBMISSION_TYPE = {
  AIN: 'Automatic Inclusion Notice',
  MIA: 'Manual Inclusion Application',
  MIN: 'Manual Inclusion Notice',
};

const DEAL_TYPE = {
  GEF: 'GEF',
  BSS_EWCS: 'BSS/EWCS',
};

const UNDERWRITING_MANAGERS_DECISION_INPUT = {
  APPROVE_WITH_CONDITIONS: 'Approve with conditions',
  APPROVE_WITHOUT_CONDITIONS: 'Approve without conditions',
  DECLINE: 'Decline',
};

const DEAL_STAGE = {
  UKEF_APPROVED_WITH_CONDITIONS: 'Approved (with conditions)',
  APPROVED_WITHOUT_CONDITIONS: 'Approved (without conditions)',
  DECLINED: 'Declined',
  CONFIRMED: 'Confirmed',
  AMENDMENT_IN_PROGRESS: 'Amendment in progress',
};

module.exports = {
  SUBMISSION_TYPE,
  DEAL_TYPE,
  UNDERWRITING_MANAGERS_DECISION_INPUT,
  DEAL_STAGE,
};
