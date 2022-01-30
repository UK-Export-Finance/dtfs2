const CONSTANTS = require('../../../src/constants');

const MOCK_ALL_DEALS = [
  {
    status: CONSTANTS.DEAL.DEAL_STATUS.DRAFT,
    bankInternalRefName: 'mock',
    exporter: 'mock company',
    product: CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS,
    submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
    updatedAt: 123456,
  },
  {
    status: CONSTANTS.DEAL.DEAL_STATUS.READY_FOR_APPROVAL,
    bankInternalRefName: 'mock',
    exporter: 'mock company',
    product: CONSTANTS.DEAL.DEAL_TYPE.GEF,
    submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
    updatedAt: 7891011,
  },
];

const MOCK_DEALS = [
  {
    status: CONSTANTS.DEAL.DEAL_STATUS.DRAFT,
    bankInternalRefName: 'mock',
    dealType: CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS,
    submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
    updatedAt: 123456,
    bank: { id: '9' },
  },
  {
    status: CONSTANTS.DEAL.DEAL_STATUS.READY_FOR_APPROVAL,
    bankInternalRefName: 'mock',
    dealType: CONSTANTS.DEAL.DEAL_TYPE.GEF,
    submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
    updatedAt: 7891011,
    bank: { id: '9' },
  },
];

module.exports = {
  MOCK_ALL_DEALS,
  MOCK_DEALS
};
