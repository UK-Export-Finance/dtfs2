const { DEAL_SUBMISSION_TYPE } = require('@ukef/dtfs2-common');

const SUBMISSION_TYPE = DEAL_SUBMISSION_TYPE;

const DEAL_TYPE = {
  GEF: 'GEF',
  BSS_EWCS: 'BSS/EWCS',
};

const UNDERWRITING_MANAGERS_DECISION_INPUT = {
  APPROVE_WITH_CONDITIONS: 'Approved with conditions',
  APPROVE_WITHOUT_CONDITIONS: 'Approved without conditions',
  DECLINED: 'Declined',
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
