const DEAL_TYPE = {
  GEF: 'GEF',
  BSS_EWCS: 'BSS/EWCS',
};

const DEAL_PRODUCT_CODE = {
  BOND: 'BSS',
  LOAN: 'EWCS',
  BOND_AND_LOAN: 'BSS & EWCS',
};

const SUBMISSION_TYPE = {
  AIN: 'Automatic Inclusion Notice',
  MIA: 'Manual Inclusion Application',
  MIN: 'Manual Inclusion Notice',
};

const DEAL_STAGE_TFM = {
  CONFIRMED: 'Confirmed',
  APPLICATION: 'Application',
  IN_PROGRESS_BY_UKEF: 'In progress',
  UKEF_APPROVED_WITH_CONDITIONS: 'Approved (with conditions)',
  UKEF_APPROVED_WITHOUT_CONDITIONS: 'Approved (without conditions)',
  DECLINED: 'Declined',
  ABANDONED: 'Abandoned',
};

const CREDIT_RATING = {
  GOOD: 'Good (BB-)',
  ACCEPTABLE: 'Acceptable (B+)',
};

const LOSS_GIVEN_DEFAULT = {
  '50_PERCENT': 50,
};

const PROBABILITY_OF_DEFAULT = {
  DEFAULT_VALUE: 14.1,
};

const PORTAL_DEAL_STATUS = {
  COMPLETED: 'Completed',
  SUBMITTED_TO_UKEF: 'Submitted',
  UKEF_ACKNOWLEDGED: 'Acknowledged',
  IN_PROGRESS_BY_UKEF: 'In progress by UKEF',
  UKEF_APPROVED_WITHOUT_CONDITIONS: 'Accepted by UKEF (without conditions)',
  UKEF_APPROVED_WITH_CONDITIONS: 'Accepted by UKEF (with conditions)',
  UKEF_REFUSED: 'Rejected by UKEF',
  ABANDONED: 'Abandoned',
};

const DEAL_COMMENT_TYPE_PORTAL = {
  UKEF_COMMENT: 'ukefComments',
  UKEF_DECISION: 'ukefDecision',
};

const TFM_SORT_BY = {
  ASCENDING: 'ascending',
  DESCENDING: 'descending',
};

const AMENDMENT_UW_DECISION = {
  APPROVED_WITH_CONDITIONS: 'Approved with conditions',
  APPROVED_WITHOUT_CONDITIONS: 'Approved without conditions',
  DECLINED: 'Declined',
};

const AMENDMENT_TYPE = {
  VALUE: 'facility value',
  COVER_END_DATE: 'cover end date',
};

const AMENDMENT_BANK_DECISION = {
  PROCEED: 'Proceed',
  WITHDRAW: 'Withdrawn',
};

const AMENDMENT_STATUS = {
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  NOT_STARTED: 'Not started',
};

module.exports = {
  DEAL_TYPE,
  DEAL_PRODUCT_CODE,
  SUBMISSION_TYPE,
  DEAL_STAGE_TFM,
  CREDIT_RATING,
  LOSS_GIVEN_DEFAULT,
  PROBABILITY_OF_DEFAULT,
  PORTAL_DEAL_STATUS,
  DEAL_COMMENT_TYPE_PORTAL,
  TFM_SORT_BY,
  AMENDMENT_UW_DECISION,
  AMENDMENT_TYPE,
  AMENDMENT_BANK_DECISION,
  AMENDMENT_STATUS,
};
