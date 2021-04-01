const FACILITY_TYPE = {
  BOND: 'bond',
  LOAN: 'loan',
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

const FEE_FREQUENCY = {
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  SEMI_ANNUALLY: 'Semi-annually',
  ANNUALLY: 'Annually',
};

const COVENANT_TYPE = {
  UK_CONTRACT_VALUE: '43',
  CHARGEABLE_AMOUNT_GDP: '46',
  CHARGEABLE_AMOUNT_NON_GDP: '47',
};

const GUARANTEE_TYPE = {
  BOND_GIVER: '315',
  BOND_BENEFICIARY: '310',
  FACILITY_PROVIDER: '500',
  BUYER_FOR_EXPORTER_EWCS: '321',
};

const STAGE_CODE = {
  ISSUED: '07',
  UNISSUED: '06',
};

const FORECAST_PERCENTAGE = {
  ISSUED: 100,
  UNISSUED: 75,
};

module.exports = {
  FACILITY_TYPE,
  FACILITIES_STAGE,
  FEE_FREQUENCY,
  COVENANT_TYPE,
  GUARANTEE_TYPE,
  STAGE_CODE,
  FORECAST_PERCENTAGE,
};
