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

export default {
  FEE_TYPE,
  FEE_FREQUENCY,
  DAY_COUNT_BASIS,
  FACILITIES_STAGE,
  DEAL_STATUS,
};
