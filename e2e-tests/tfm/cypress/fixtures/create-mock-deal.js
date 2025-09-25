import { MOCK_DEAL_AIN } from '@ukef/dtfs2-common/test-helpers';

/**
 * creates a mock deal based on the MOCK_DEAL_AIN for e2e tests
 * @param {object} overrides deal overrides
 * @returns {object} created mock deal
 */
const createMockDeal = (overrides) => {
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

export default createMockDeal;
