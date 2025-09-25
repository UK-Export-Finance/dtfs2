import { MOCK_DEAL_AIN } from './mock-AIN-deal';

/**
 * creates a mock deal based on the MOCK_DEAL_AIN for e2e tests
 * @param {import('../../types').DealOverrides} overrides deal overrides
 * @returns created mock deal
 */
export const createMockDeal = (overrides) => {
  let submissionDate = new Date().valueOf().toString();
  let facilities = [{ ...MOCK_DEAL_AIN.mockFacilities[0] }];

  if (Array.isArray(overrides.mockFacilities)) {
    facilities = overrides.mockFacilities;
  }

  if (overrides?.details?.submissionDate) {
    submissionDate = overrides.details.submissionDate;
  }

  return {
    ...MOCK_DEAL_AIN,
    ...overrides,
    bank: {
      ...MOCK_DEAL_AIN.bank,
      ...(overrides.bank ? overrides.bank : {}),
    },
    details: {
      ...MOCK_DEAL_AIN.details,
      ...overrides.details,
      submissionDate,
    },
    submissionDetails: {
      ...MOCK_DEAL_AIN.submissionDetails,
      ...overrides.submissionDetails,
    },
    mockFacilities: facilities,
  };
};
