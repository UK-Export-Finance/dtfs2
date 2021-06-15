import MOCK_DEAL_AIN from './deal-AIN';

const createMockDeal = (overrides) => ({
  ...MOCK_DEAL_AIN,
  details: {
    ...MOCK_DEAL_AIN.details,
    ...overrides.details,
  },
  submissionDetails: {
    ...MOCK_DEAL_AIN.submissionDetails,
    ...overrides.submissionDetails,
  },
});

module.exports = createMockDeal;
