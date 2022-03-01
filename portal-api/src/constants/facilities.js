const FACILITY_TYPE = {
  BOND: 'Bond',
  LOAN: 'Loan',
  CASH: 'Cash',
  CONTINGENT: 'Contingent'
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

const DAY_COUNT_BASIS = {
  360: '360',
  365: '365',
};

const FACILITIES_STAGE = {
  LOAN: {
    CONDITIONAL: 'Conditional',
    UNCONDITIONAL: 'Unconditional',
  },
  BOND: {
    UNISSUED: 'Unissued',
    ISSUED: 'Issued',
  },
};

const DEAL_STATUS = {
  COMPLETED: 'Completed',
  INCOMPLETE: 'Incomplete',
  NOT_STARTED: 'Not started',
  ACKNOWLEDGED: 'Acknowledged',
  READY_FOR_APPROVAL: 'Ready for check',
  SUBMITTED_TO_UKEF: 'Submitted',
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

const FACILITY_PROVIDED_DETAILS = {
  TERM: 'TERM',
  RESOLVING: 'RESOLVING',
  COMMITTED: 'COMMITTED',
  UNCOMMITTED: 'UNCOMMITTED',
  ON_DEMAND: 'ON_DEMAND',
  FACTORING: 'FACTORING',
  OTHER: 'OTHER',
};

module.exports = {
  FACILITY_TYPE,
  FEE_TYPE,
  FEE_FREQUENCY,
  DAY_COUNT_BASIS,
  FACILITIES_STAGE,
  TYPE,
  DEAL_STATUS,
  FACILITY_PROVIDED_DETAILS,
};
