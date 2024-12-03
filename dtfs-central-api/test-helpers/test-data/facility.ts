import { ObjectId } from 'mongodb';
import { CURRENCY, Facility } from '@ukef/dtfs2-common';
import { generateMockPortalUserAuditDatabaseRecord } from '@ukef/dtfs2-common/change-stream/test-helpers';

export const aFacility = (): Facility => ({
  _id: new ObjectId(),
  dealId: new ObjectId(),
  type: 'Cash',
  hasBeenIssued: true,
  name: 'facilityName',
  shouldCoverStartOnSubmission: true,
  coverStartDate: new Date(),
  coverEndDate: new Date(),
  issueDate: null,
  monthsOfCover: 12,
  details: [],
  detailsOther: '',
  currency: {
    id: CURRENCY.GBP,
  },
  value: 100000,
  coverPercentage: 80,
  interestPercentage: 5,
  paymentType: 'cash',
  createdAt: new Date().getTime(),
  updatedAt: new Date().getTime(),
  ukefExposure: 80000,
  guaranteeFee: 10,
  submittedAsIssuedDate: null,
  ukefFacilityId: '12345678',
  feeType: 'cash',
  feeFrequency: 'Monthly',
  dayCountBasis: 365,
  coverDateConfirmed: null,
  hasBeenIssuedAndAcknowledged: null,
  canResubmitIssuedFacilities: null,
  unissuedToIssuedByMaker: {},
  auditRecord: generateMockPortalUserAuditDatabaseRecord(new ObjectId()),
});
