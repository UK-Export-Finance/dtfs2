import moment from 'moment';
import MOCK_DEAL_AIN from './deal-AIN';

const createMockDeal = (overrides) => {
  let submissionDate = moment().utc().valueOf().toString();
  let facilities = MOCK_DEAL_AIN.mockFacilities;

  if (overrides.mockFacilities) {
    facilities = overrides.mockFacilities;
  }

  if (overrides.details.submissionDate) {
    submissionDate = overrides.details.submissionDate;
  }

  return {
    ...MOCK_DEAL_AIN,
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
