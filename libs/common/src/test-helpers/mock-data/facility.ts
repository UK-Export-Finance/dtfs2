import { generateObjectIdId } from '../../utils/generate-object-id-id';
import { getEpochMs } from '../../helpers';
import { CURRENCY } from '../../constants/currency';
import { GEF_FACILITY_TYPE } from '../../constants';

export const MOCK_FACILITY = {
  _id: generateObjectIdId(),
  dealId: generateObjectIdId(),
  coverEndDate: new Date(2022, 1, 1).toISOString(),
  issueDate: new Date(2022, 1, 1).toISOString(),
  monthsOfCover: 5,
  type: GEF_FACILITY_TYPE.CASH,
  details: ['Mock detail 1', 'Mock detail 2'],
  detailsOther: 'Mock other detail',
  coverPercentage: 5,
  interestPercentage: 0.05,
  createdAt: getEpochMs(),
  updatedAt: getEpochMs(),
  ukefFacilityId: '0000001',
  dayCountBasis: 1,
  canResubmitIssuedFacilities: true,
  unissuedToIssuedByMaker: undefined,
  isUsingFacilityEndDate: true,
  facilityEndDate: undefined,
  bankReviewDate: undefined,
  hasBeenIssued: true,
  shouldCoverStartOnSubmission: true,
  coverStartDate: new Date(2022, 1, 1).toISOString(),
  name: 'Mock Facility Name',
  paymentType: 'Monthly',
  ukefExposure: 1000,
  guaranteeFee: 0.01,
  currency: {
    id: CURRENCY.GBP,
  },
  value: 10000,
  submittedAsIssuedDate: null,
  feeType: 'Cash',
  feeFrequency: '5',
  coverDateConfirmed: true,
  hasBeenIssuedAndAcknowledged: true,
};
