const CONSTANTS = require('../../../../constants');

const DEAL = {
  SME_TYPE: {
    [CONSTANTS.DEAL.SME_TYPE.MICRO]: '1',
    [CONSTANTS.DEAL.SME_TYPE.SMALL]: '2',
    [CONSTANTS.DEAL.SME_TYPE.MEDIUM]: '3',
    [CONSTANTS.DEAL.SME_TYPE.NOT_KNOWN]: '4',
    [CONSTANTS.DEAL.SME_TYPE.NON_SME]: '5',
  },

  SUPPLIER_TYPE: {
    [CONSTANTS.DEAL.SUPPLIER_TYPE.EXPORTER]: '1',
    [CONSTANTS.DEAL.SUPPLIER_TYPE.UK_SUPPLIER]: '2',
  },

  DEAL_FILES: {
    exporterQuestionnaire: 'Exporter_questionnaire',
    auditedFinancialStatements: 'Audited_financial_statements',
    yearToDateManagement: 'Year_to_date_management',
    financialForecasts: 'Financial_forecasts',
    financialInformationCommentary: 'Financial_information_commentary',
    corporateStructure: 'Corporate_structure',
  },

  STATUS: {
    [CONSTANTS.DEAL.STATUS.DRAFT]: 'draft',
    [CONSTANTS.DEAL.STATUS.SUBMITTED]: 'submitted',
    [CONSTANTS.DEAL.STATUS.SUBMISSION_ACKNOWLEDGED]: ['submission_acknowledged', 'confirmation_acknowledged'],
    [CONSTANTS.DEAL.STATUS.APPROVED]: 'approved',
    [CONSTANTS.DEAL.STATUS.APPROVED_WITH_CONDITIONS]: 'approved_conditions',
    [CONSTANTS.DEAL.STATUS.REFUSED]: 'refused',
    [CONSTANTS.DEAL.STATUS.CONFIRMED_BY_BANK]: 'confirmed_by_bank',
    [CONSTANTS.DEAL.STATUS.IN_PROGRESS_BY_UKEF]: 'in_progress_by_ukef',
  },

};

const FACILITIES = {

  FEE_TYPE: {
    [CONSTANTS.FACILITIES.FEE_TYPE.ADVANCE]: '1',
    [CONSTANTS.FACILITIES.FEE_TYPE.ARREAR]: '2',
    [CONSTANTS.FACILITIES.FEE_TYPE.MATURITY]: '3',
  },

  FEE_FREQUENCY: {
    [CONSTANTS.FACILITIES.FEE_FREQUENCY.MONTHLY]: '1',
    [CONSTANTS.FACILITIES.FEE_FREQUENCY.QUARTERLY]: '2',
    [CONSTANTS.FACILITIES.FEE_FREQUENCY.SEMI_ANNUALLY]: '3',
    [CONSTANTS.FACILITIES.FEE_FREQUENCY.ANNUALLY]: '4',
  },

  DAY_COUNT_BASIS: {
    [CONSTANTS.FACILITIES.DAY_COUNT_BASIS['360']]: '1',
    [CONSTANTS.FACILITIES.DAY_COUNT_BASIS['365']]: '2',
  },

  FACILITIES_STAGE: {
    // loans
    [CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.CONDITIONAL]: '2',
    [CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL]: '3',

    // bonds
    [CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.UNISSUED]: '2',
    [CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED]: '3',
  },

  TYPE: {
    [CONSTANTS.FACILITIES.TYPE.ADVANCE_PAYMENT_GUARANTEE]: '1',
    [CONSTANTS.FACILITIES.TYPE.BID_BOND]: '2',
    [CONSTANTS.FACILITIES.TYPE.MAINTENANCE_BOND]: '3',
    [CONSTANTS.FACILITIES.TYPE.PERFORMANCE_BOND]: '5',
    [CONSTANTS.FACILITIES.TYPE.PROGRESS_PAYMENT_BOND]: '6',
    [CONSTANTS.FACILITIES.TYPE.RETENTION_BOND]: '7',
    [CONSTANTS.FACILITIES.TYPE.STANDBY_LETTER_OF_CREDIT]: '8',
    [CONSTANTS.FACILITIES.TYPE.WARRANY_LETTER]: '9',
  },
};

const K2MapData = {
  FACILITIES,
  DEAL,
};

const findPortalValue = (constantTypeStr, constantFieldStr, k2Value) => {
  const constantType = K2MapData[constantTypeStr];
  if (!constantType) {
    return k2Value;
  }

  const constantField = constantType[constantFieldStr];
  if (!constantField) {
    return k2Value;
  }

  const mappedValue = Object.entries(constantField).find((portalValue) => {
    if (Array.isArray(portalValue[1])) {
      return portalValue[1].includes(k2Value);
    }

    return portalValue[1] === k2Value.toString();
  });

  if (mappedValue) {
    return mappedValue[0];
  }

  return k2Value;
};

const K2MAP = {
  ...K2MapData,
  findPortalValue,
};

module.exports = K2MAP;
