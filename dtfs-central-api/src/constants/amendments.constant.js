const AMENDMENT_STATUS = {
  NOT_STARTED: 'Not started',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
};

const AMENDMENT_BANK_DECISION = {
  PROCEED: 'Proceed',
  WITHDRAW: 'Withdrawn',
  NOT_APPLICABLE: 'Not applicable',
  AWAITING_DECISION: 'Awaiting decision',
};

const AMENDMENT_MANAGER_DECISIONS = {
  APPROVED_WITH_CONDITIONS: 'Approved with conditions',
  APPROVED_WITHOUT_CONDITIONS: 'Approved without conditions',
  DECLINED: 'Declined',
};

module.exports = {
  AMENDMENT_STATUS,
  AMENDMENT_BANK_DECISION,
  AMENDMENT_MANAGER_DECISIONS
};
