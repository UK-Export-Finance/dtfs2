const MOCK_USERS = require('../../../../fixtures/users');
const CONSTANTS = require('../../../../fixtures/constants');

const { BANK1_MAKER1 } = MOCK_USERS;

const BASE_DEAL = {
  bank: { id: BANK1_MAKER1.bank.id },
  additionalRefName: 'Mock',
  exporter: {
    companyName: 'Mock company',
  },
};

const GEF_DEAL_BASE = {
  ...BASE_DEAL,
  dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
};

const GEF_DEAL_DRAFT = {
  ...GEF_DEAL_BASE,
  status: CONSTANTS.DEALS.DEAL_STATUS.DRAFT,
  bankInternalRefName: 'Draft GEF',
};

const GEF_FACILITY_CASH = {
  type: CONSTANTS.FACILITY.FACILITY_TYPE.CASH,
};

const GEF_FACILITY_CONTINGENT = {
  type: CONSTANTS.FACILITY.FACILITY_TYPE.CONTINGENT,
};

module.exports = {
  GEF_DEAL_DRAFT,
  GEF_FACILITY_CASH,
  GEF_FACILITY_CONTINGENT,
};
