const SUBMISSION_TYPE = {
  AIN: 'Automatic Inclusion Notice',
  MIA: 'Manual Inclusion Application',
  MIN: 'Manual Inclusion Notice',
};

const UNDERWRITING_MANAGERS_DECISION_INPUT = {
  APPROVE_WITH_CONDITIONS: 'Approve with conditions',
  APPROVE_WITHOUT_CONDITIONS: 'Approve without conditions',
  DECLINE: 'Decline',
};

const DEAL_STAGE = {
  APPROVED_WITH_CONDITIONS: 'Approved (with conditions)',
  APPROVED_WITHOUT_CONDITIONS: 'Approved (without conditions)',
  DECLINED: 'Declined',
};

const TFM_SORT_BY = {
  ASCENDING: 'ascending',
  DESCENDING: 'descending',
};

const TFM_SORT_BY_DEFAULT = {
  field: 'dealSnapshot.details.submissionDate',
  order: TFM_SORT_BY.ASCENDING,
};


module.exports = {
  SUBMISSION_TYPE,
  UNDERWRITING_MANAGERS_DECISION_INPUT,
  DEAL_STAGE,
  TFM_SORT_BY,
  TFM_SORT_BY_DEFAULT,
};
