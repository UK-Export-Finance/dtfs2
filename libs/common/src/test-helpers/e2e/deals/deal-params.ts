import { MOCK_DEAL_AIN } from './mock-AIN-deal';
import { FACILITY_TYPE } from '../../../constants';
import { yesterday, twoDaysAgo } from '../date-constants';

export const DEAL_WITH_TEST_SUPPLIER_NAME_VARS = {
  status: 'Submitted',
  submissionDetails: { 'supplier-name': 'MY-SUPPLIER' },
};

export const DEAL_WITH_TEST_MIN_SUBMISSION_TYPE_VARS = {
  submissionType: 'Manual Inclusion Notice',
  status: 'Submitted',
};

export const DEAL_WITH_TEST_BUYER_NAME_VARS = {
  status: 'Submitted',
  submissionDetails: { 'buyer-name': 'MY-BUYER' },
};

export const DEAL_WITH_TEST_MIA_SUBMISSION_TYPE_VARS = {
  status: 'Submitted',
  submissionType: 'Manual Inclusion Application',
  testId: 'DEAL_WITH_TEST_MIA_SUBMISSION_TYPE',
};

export const DEAL_WITH_ONLY_1_FACILITY_BOND_VARS = {
  testId: 'DEAL_WITH_ONLY_1_FACILITY_BOND',
  mockFacilities: [MOCK_DEAL_AIN.mockFacilities.find((f) => f.type === FACILITY_TYPE.BOND)],
};

export const DEAL_WITH_ONLY_1_FACILITY_LOAN_VARS = {
  testId: 'DEAL_WITH_ONLY_1_FACILITY_LOAN',
  mockFacilities: [MOCK_DEAL_AIN.mockFacilities.find((f) => f.type === FACILITY_TYPE.LOAN)],
};

// NOTE: searching by date queries multiple fields.
// Therefore we need to set all of these fields to yesterday.
export const DEAL_COMPLETED_YESTERDAY_VARS = {
  testId: 'DEAL_COMPLETED_YESTERDAY',
  eligibility: {
    lastUpdated: yesterday.unixMillisecondsString,
  },
  facilitiesUpdated: yesterday.unixMillisecondsString,
};

export const DEAL_BUYER_A_VARS = {
  testId: 'DEAL_BUYER_A',
  submissionDetails: {
    'buyer-name': 'BUYER A',
  },
};

export const DEAL_BUYER_B_VARS = {
  testId: 'DEAL_BUYER_B',
  submissionDetails: {
    'buyer-name': 'BUYER B',
  },
};

// Exporter (called supplier-name in a BSS deal), is generated automatically with mock data and deal ID.
export const DEAL_A_SUPPLIER_VARS = {
  testId: 'DEAL_A_SUPPLIER',
  submissionDetails: { 'supplier-name': 'SUPPLIER A' },
};

export const DEAL_B_SUPPLIER_VARS = {
  testId: 'DEAL_B_SUPPLIER',
  submissionDetails: { 'supplier-name': 'SUPPLIER B' },
};

export const DEAL_WITH_1_LOAN_AND_BOND_FACILITIES_VARS = {
  testId: 'DEAL_WITH_1_LOAN_AND_BOND_FACILITIES',
  mockFacilities: MOCK_DEAL_AIN.mockFacilities,
};

export const DEAL_NOT_RECENT_VARS = {
  details: {
    ukefDealId: 1,
    submissionDate: new Date(twoDaysAgo.unixMilliseconds).setSeconds(0, 0).toString(),
  },
  submissionDetails: {
    'buyer-name': 'NOT RECENT',
  },
};

export const DEAL_MOST_RECENT_VARS = {
  details: {
    ukefDealId: 2,
    submissionDate: new Date(yesterday.unixMilliseconds).setSeconds(0, 0).toString(),
  },
  submissionDetails: {
    'buyer-name': 'RECENT',
  },
};

export const DEAL_CONFIRMED_VARS = {
  testId: 'DEAL_CONFIRMED',
};

export const DEAL_APPLICATION_VARS = {
  submissionType: 'Manual Inclusion Application',
  testId: 'DEAL_APPLICATION',
};
