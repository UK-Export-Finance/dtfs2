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

const AMENDMENT_QUERY_STATUSES = {
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
};

const AMENDMENT_QUERIES = {
  LATEST_VALUE: 'latest-value',
  LATEST_COVER_END_DATE: 'latest-cover-end-date',
  LATEST: 'latest',
};

module.exports = {
  AMENDMENT_STATUS,
  AMENDMENT_BANK_DECISION,
  AMENDMENT_MANAGER_DECISIONS,
  AMENDMENT_QUERY_STATUSES,
  AMENDMENT_QUERIES,
};
