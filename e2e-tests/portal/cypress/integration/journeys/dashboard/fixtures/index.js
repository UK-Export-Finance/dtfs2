const MOCK_USERS = require('../../../../fixtures/users');
const CONSTANTS = require('../../../../fixtures/constants');

const { BANK1_MAKER1 } = MOCK_USERS;

const BASE_DEAL = {
  bank: { id: BANK1_MAKER1.bank.id },
  additionalRefName: 'Mock',
  exporter: {
    companyName: 'Mock company name',
  },
};

const BSS_DEAL_BASE = {
  ...BASE_DEAL,
  dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
  submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.AIN,
};

const GEF_DEAL_BASE = {
  ...BASE_DEAL,
  dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
};

const BSS_DEAL_DRAFT = {
  ...BSS_DEAL_BASE,
  status: CONSTANTS.DEALS.DEAL_STATUS.DRAFT,
  bankInternalRefName: 'Draft BSS',
};

const BSS_DEAL_READY_FOR_CHECK = {
  ...BSS_DEAL_BASE,
  status: CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL,
  bankInternalRefName: 'Ready Check BSS',
};

const BSS_DEAL_AIN = {
  ...BSS_DEAL_BASE,
  status: CONSTANTS.DEALS.DEAL_STATUS.DRAFT,
  bankInternalRefName: 'AIN BSS',
};

const BSS_DEAL_MIA = {
  ...BSS_DEAL_BASE,
  submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.MIA,
  bankInternalRefName: 'MIA BSS',
};

const GEF_DEAL_DRAFT = {
  ...GEF_DEAL_BASE,
  status: CONSTANTS.DEALS.DEAL_STATUS.DRAFT,
  bankInternalRefName: 'Draft GEF',
};

const BSS_FACILITY_BOND = {
  type: CONSTANTS.FACILITY.FACILITY_TYPE.BOND,
};

const BSS_FACILITY_BOND_ISSUED = {
  type: CONSTANTS.FACILITY.FACILITY_TYPE.BOND,
  hasBeenIssued: true,
};

const BSS_FACILITY_BOND_UNISSUED = {
  type: CONSTANTS.FACILITY.FACILITY_TYPE.BOND,
  hasBeenIssued: false,
};

const BSS_FACILITY_LOAN = {
  type: CONSTANTS.FACILITY.FACILITY_TYPE.LOAN,
};

const GEF_FACILITY_CASH = {
  type: CONSTANTS.FACILITY.FACILITY_TYPE.CASH,
};

const GEF_FACILITY_CONTINGENT = {
  type: CONSTANTS.FACILITY.FACILITY_TYPE.CONTINGENT,
};

module.exports = {
  BSS_DEAL_DRAFT,
  BSS_DEAL_READY_FOR_CHECK,
  BSS_DEAL_AIN,
  BSS_DEAL_MIA,
  GEF_DEAL_DRAFT,
  BSS_FACILITY_BOND,
  BSS_FACILITY_BOND_ISSUED,
  BSS_FACILITY_BOND_UNISSUED,
  BSS_FACILITY_LOAN,
  GEF_FACILITY_CASH,
  GEF_FACILITY_CONTINGENT,
};
