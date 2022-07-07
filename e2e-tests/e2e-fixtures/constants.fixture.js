export const TFM_URL = 'http://localhost:5003';

export const DEAL_TYPE = {
  BSS_EWCS: 'BSS/EWCS',
  GEF: 'GEF',
};

export const SUBMISSION_TYPE = {
  AIN: 'Automatic Inclusion Notice',
  MIA: 'Manual Inclusion Application',
  MIN: 'Manual Inclusion Notice',
};

export const FACILITY_TYPE = {
  CASH: 'Cash',
  CONTINGENT: 'Contingent',
  BOND: 'Bond',
  LOAN: 'Loan',
};

export const FACILITY_STAGE = {
  UNISSUED: 'Unissued',
  ISSUED: 'Issued',
  CONDITIONAL: 'Conditional',
  UNCONDITIONAL: 'Unconditional',
};

export const DEAL_STATUS = {
  DRAFT: 'Draft',
  READY_FOR_APPROVAL: 'Ready for Checker\'s approval',
  CHANGES_REQUIRED: 'Further Maker\'s input required',
  ABANDONED: 'Abandoned',
  SUBMITTED_TO_UKEF: 'Submitted',
  UKEF_ACKNOWLEDGED: 'Acknowledged',
  UKEF_IN_PROGRESS: 'In progress by UKEF',
  UKEF_APPROVED_WITH_CONDITIONS: 'Accepted by UKEF (with conditions)',
  UKEF_APPROVED_WITHOUT_CONDITIONS: 'Accepted by UKEF (without conditions)',
  UKEF_REFUSED: 'Rejected by UKEF',
};

export const TFM_DEAL_STAGE = {
  CONFIRMED: 'Confirmed',
  AMENDMENT_IN_PROGRESS: 'Amendment in progress',
};

export const UNDERWRITER_MANAGER_DECISIONS = {
  APPROVED_WITH_CONDITIONS: 'Approved with conditions',
  APPROVED_WITHOUT_CONDITIONS: 'Approved without conditions',
  DECLINED: 'Declined',
  NOT_ADDED: 'Not added',
  AUTOMATIC_APPROVAL: 'Automatic approval',
  AWAITING_DECISION: 'Awaiting decision',
};
