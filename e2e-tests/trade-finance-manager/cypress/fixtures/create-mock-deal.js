import MOCK_DEAL_AIN from './deal-AIN';

const createMockDeal = (overrides) => {
  let submissionDate = new Date().valueOf().toString();
  let facilities = [
    { ...MOCK_DEAL_AIN.mockFacilities[0] },
  ];

  if (overrides.mockFacilities) {
    facilities = overrides.mockFacilities;
  }

  if (overrides?.details?.submissionDate) {
    submissionDate = overrides.details.submissionDate;
  }

  return {
    ...MOCK_DEAL_AIN,
    ...overrides,
    details: {
      ...MOCK_DEAL_AIN.details,
      ...overrides.details,
      owningBank: {
        ...MOCK_DEAL_AIN.details.owningBank,
        ...overrides.details && overrides.details.owningBank ? overrides.details.owningBank : {},
      },
      submissionDate,
    },
    submissionDetails: {
      ...MOCK_DEAL_AIN.submissionDetails,
      ...overrides.submissionDetails,
    },
    mockFacilities: facilities,
  };
};

module.exports = createMockDeal;
