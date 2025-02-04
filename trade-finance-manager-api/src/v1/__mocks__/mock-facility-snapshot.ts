import { CURRENCY, Facility, FACILITY_TYPE } from '@ukef/dtfs2-common';
import { generateMockPortalUserAuditDatabaseRecord } from '@ukef/dtfs2-common/change-stream/test-helpers';
import { ObjectId } from 'mongodb';

export const MOCK_FACILITY_SNAPSHOT: Facility = {
  _id: new ObjectId(),
  dealId: new ObjectId(),
  type: FACILITY_TYPE.CASH,
  hasBeenIssued: true,
  name: 'Test Facility',
  shouldCoverStartOnSubmission: true,
  coverStartDate: new Date('2021-01-01'),
  coverEndDate: new Date('2023-01-01'),
  issueDate: null,
  monthsOfCover: null,
  details: ['Revolving or renewing basis'],
  detailsOther: '',
  currency: {
    id: CURRENCY.GBP,
  },
  value: 50000,
  coverPercentage: 10,
  interestPercentage: 5,
  paymentType: 'Quarterly',
  createdAt: 1718728159228,
  updatedAt: 1718728346991,
  ukefExposure: 5000,
  guaranteeFee: 4.5,
  submittedAsIssuedDate: '1718728345615',
  ukefFacilityId: '0040769518',
  feeType: 'At maturity',
  feeFrequency: 'Monthly',
  dayCountBasis: 360,
  coverDateConfirmed: true,
  hasBeenIssuedAndAcknowledged: null,
  canResubmitIssuedFacilities: null,
  unissuedToIssuedByMaker: {},
  auditRecord: generateMockPortalUserAuditDatabaseRecord(new ObjectId()),
};
