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
  BANK_CHECK: 'Ready for Checker\'s approval',
  CHANGES_REQUIRED: 'Further Maker\'s input required',
  ABANDONED: 'Abandoned',
  SUBMITTED_TO_UKEF: 'Submitted',
  UKEF_ACKNOWLEDGED: 'Acknowledged by UKEF',
  UKEF_IN_PROGRESS: 'In progress by UKEF',
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

module.exports = {
  DEAL_TYPE, DEAL_SUBMISSION_TYPE, DEAL_STATUS, FACILITY_TYPE,
};
