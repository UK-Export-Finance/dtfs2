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

export const FEE_TYPE = {
  ADVANCE: 'In advance',
  ARREAR: 'In arrear',
  MATURITY: 'At maturity',
};

export const FEE_FREQUENCY = {
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  SEMI_ANNUALLY: 'Semi-annually',
  ANNUALLY: 'Annually',
};

export const BSS_FACILITY_TYPE = {
  ADVANCE_PAYMENT_GUARANTEE: 'Advance payment guarantee',
  BID_BOND: 'Bid bond',
  MAINTENANCE_BOND: 'Maintenance bond',
  PERFORMANCE_BOND: 'Performance bond',
  PROGRESS_PAYMENT_BOND: 'Progress payment bond',
  RETENTION_BOND: 'Retention bond',
  STANDBY_LETTER_OF_CREDIT: 'Standby letter of credit',
  WARRANTY_LETTER: 'Warranty letter',
};

export const DAY_COUNT_BASIS = {
  360: '360',
  365: '365',
};

export const CURRENCY = {
  AED: 'AED',
  AED_TEXT: 'AED - U.A.E. Dirham',
  GBP: 'GBP',
};
