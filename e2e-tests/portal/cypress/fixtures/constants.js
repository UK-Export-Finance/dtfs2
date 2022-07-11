const DEAL_TYPE = {
  BSS_EWCS: 'BSS/EWCS',
  GEF: 'GEF',
};

const DEAL_STATUS = {
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

const SECTION_STATUS = {
  NOT_STARTED: 'Not started',
  COMPLETED: 'Completed',
  INCOMPLETE: 'Incomplete',
};

const SUBMISSION_TYPE = {
  AIN: 'Automatic Inclusion Notice',
  MIA: 'Manual Inclusion Application',
  MIN: 'Manual Inclusion Notice',
};

const FACILITY_TYPE = {
  CASH: 'Cash',
  CONTINGENT: 'Contingent',
  BOND: 'Bond',
  LOAN: 'Loan',
};

const FACILITY_STAGE = {
  UNISSUED: 'Unissued',
  ISSUED: 'Issued',
  CONDITIONAL: 'Conditional',
  UNCONDITIONAL: 'Unconditional',
};

const FEE_TYPE = {
  ADVANCE: 'In advance',
  ARREAR: 'In arrear',
  MATURITY: 'At maturity',
};

const FEE_FREQUENCY = {
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  SEMI_ANNUALLY: 'Semi-annually',
  ANNUALLY: 'Annually',
};

const TYPE = {
  ADVANCE_PAYMENT_GUARANTEE: 'Advance payment guarantee',
  BID_BOND: 'Bid bond',
  MAINTENANCE_BOND: 'Maintenance bond',
  PERFORMANCE_BOND: 'Performance bond',
  PROGRESS_PAYMENT_BOND: 'Progress payment bond',
  RETENTION_BOND: 'Retention bond',
  STANDBY_LETTER_OF_CREDIT: 'Standby letter of credit',
  WARRANTY_LETTER: 'Warranty letter',
};

const DAY_COUNT_BASIS = {
  360: '360',
  365: '365',
};

const CURRENCY = {
  AED: 'AED',
  AED_TEXT: 'AED - U.A.E. Dirham',
};

module.exports = {
  DEALS: {
    DEAL_TYPE,
    DEAL_STATUS,
    SUBMISSION_TYPE,
    SECTION_STATUS,
  },
  FACILITY: {
    FACILITY_TYPE,
    FACILITY_STAGE,
    FEE_TYPE,
    FEE_FREQUENCY,
    TYPE,
    DAY_COUNT_BASIS,
    CURRENCY,
  },
};
