const DEAL_TYPE = {
  GEF: 'GEF',
  BSS_EWCS: 'BSS/EWCS',
};

const DEAL_SUBMISSION_TYPE = {
  AIN: 'Automatic Inclusion Notice',
  MIA: 'Manual Inclusion Application',
  MIN: 'Manual Inclusion Notice',
};

const DEAL_STATUS = {
  // these statuses can be either on the top level
  // or in a child object, not specific to the entire deal.
  DRAFT: 'Draft',
  NOT_STARTED: 'Not started',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',

  // statuses specific to the entire deal
  READY_FOR_APPROVAL: 'Ready for Checker\'s approval',
  CHANGES_REQUIRED: 'Further Maker\'s input required',
  ABANDONED: 'Abandoned',
  SUBMITTED_TO_UKEF: 'Submitted',
  UKEF_ACKNOWLEDGED: 'Acknowledged',
  IN_PROGRESS_BY_UKEF: 'In progress by UKEF',
  UKEF_APPROVED_WITH_CONDITIONS: 'Accepted by UKEF (with conditions)',
  UKEF_APPROVED_WITHOUT_CONDITIONS: 'Accepted by UKEF (without conditions)',
  UKEF_REFUSED: 'Rejected by UKEF',
  EXPIRED: 'Expired',
  WITHDRAWN: 'Withdrawn',
};

const FACILITY_TYPE = {
  BOND: 'Bond',
  LOAN: 'Loan',
  CASH: 'Cash',
  CONTINGENT: 'Contingent',
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

const USER_TEAMS = {
  PIM: 'Post issue management',
  UNDERWRITERS: 'Underwriters',
  RISK_MANAGERS: 'Risk managers',
  BUSINESS_SUPPORT: 'Business support group',
  UNDERWRITER_MANAGERS: 'Underwriter managers',
  UNDERWRITING_SUPPORT: 'Underwriting support',
};

module.exports = {
  DEAL_TYPE,
  DEAL_SUBMISSION_TYPE,
  DEAL_STATUS,
  FACILITY_TYPE,
  DEAL_STAGE_TFM,
  USER_TEAMS,
};
