const CONSTANTS = require('../../../../../fixtures/constants');
const MOCK_USERS = require('../../../../../fixtures/users');

const {
  BANK1_MAKER1,
  BANK1_MAKER2,
  BANK2_MAKER2,
} = MOCK_USERS;

const BSS_DEAL = {
  dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
  submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.AIN,
  bankInternalRefName: 'Draft BSS',
  additionalRefName: 'Tibettan submarine acquisition scheme',
  status: CONSTANTS.DEALS.DEAL_STATUS.DRAFT,
  exporter: {
    companyName: 'mock company',
  },
};

const BSS_DEAL_BANK_2_MAKER_2 = {
  ...BSS_DEAL,
  bank: { id: BANK2_MAKER2.bank.id },
};

const GEF_DEAL = {
  dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
  submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.AIN,
  bank: { id: BANK1_MAKER1.bank.id },
  bankInternalRefName: 'Draft GEF',
  status: CONSTANTS.DEALS.DEAL_STATUS.DRAFT,
  exporter: {
    companyName: 'mock company',
  },
};

const GEF_DEAL_MAKER_2 = {
  ...GEF_DEAL,
  bank: { id: BANK1_MAKER2.bank.id },
  bankInternalRefName: 'Draft GEF Bank 1 Maker 2',
};

const GEF_DEAL_BANK_2_MAKER_2 = {
  ...GEF_DEAL,
  bank: { id: BANK2_MAKER2.bank.id },
  bankInternalRefName: 'Draft GEF Bank 2 Maker 2',
};

module.exports = {
  BSS_DEAL,
  BSS_DEAL_BANK_2_MAKER_2,
  GEF_DEAL,
  GEF_DEAL_MAKER_2,
  GEF_DEAL_BANK_2_MAKER_2,
};
