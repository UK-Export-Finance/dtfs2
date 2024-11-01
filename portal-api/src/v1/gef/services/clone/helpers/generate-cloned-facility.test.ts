import { Facility, FACILITY_TYPE } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { add } from 'date-fns';
import { generateAuditDatabaseRecordFromAuditDetails, generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { generateClonedFacility } from './generate-cloned-facility';

const existingDealId = new ObjectId().toString();
const newDealId = new ObjectId();
const mockAuditDetails = generateSystemAuditDetails();

const issuedFacility: Facility = {
  _id: new ObjectId(),
  dealId: new ObjectId(existingDealId),
  type: FACILITY_TYPE.CASH,
  hasBeenIssued: false,
  name: 'Facility one',
  shouldCoverStartOnSubmission: true,
  coverStartDate: new Date(1638403200000),
  coverEndDate: '2030-01-01T00:00:00.000Z',
  monthsOfCover: 20,
  details: [
    'Term basis',
    'Revolving or renewing basis',
    'Committed basis',
    'Uncommitted basis',
    'On demand or overdraft basis',
    'Factoring on a  with-recourse basis',
    'Other',
  ],
  detailsOther: 'Other',
  currency: { id: 'GBP' },
  value: 2000,
  coverPercentage: 80,
  interestPercentage: 1,
  paymentType: 'IN_ADVANCE_MONTHLY',
  createdAt: 1638363596947,
  updatedAt: 1638442632540,
  ukefExposure: 1600,
  guaranteeFee: 0.9,
  submittedAsIssuedDate: '1638363717231',
  feeType: 'In advance',
  feeFrequency: 'Monthly',
  ukefFacilityId: '10000011',
  dayCountBasis: 365,
  coverDateConfirmed: null,
  canResubmitIssuedFacilities: null,
  hasBeenIssuedAndAcknowledged: null,
  issueDate: null,
};

const unissuedFacility: Facility = {
  _id: new ObjectId(),
  dealId: new ObjectId(existingDealId),
  type: FACILITY_TYPE.CASH,
  hasBeenIssued: true,
  name: 'Facility two',
  shouldCoverStartOnSubmission: true,
  coverStartDate: add(new Date(), { days: 1 }),
  coverEndDate: '2030-01-01T00:00:00.000Z',
  monthsOfCover: null,
  details: [
    'Term basis',
    'Revolving or renewing basis',
    'Committed basis',
    'Uncommitted basis',
    'On demand or overdraft basis',
    'Factoring on a  with-recourse basis',
    'Other',
  ],
  detailsOther: 'Other',
  currency: { id: 'GBP' },
  value: 2000,
  coverPercentage: 80,
  interestPercentage: 1,
  paymentType: 'IN_ADVANCE_MONTHLY',
  createdAt: 1638363596947,
  updatedAt: 1638442632540,
  ukefExposure: 1600,
  guaranteeFee: 0.9,
  submittedAsIssuedDate: '1638363717231',
  ukefFacilityId: '10000012',
  feeType: 'In advance',
  feeFrequency: 'Monthly',
  dayCountBasis: 365,
  coverDateConfirmed: true,
  canResubmitIssuedFacilities: null,
  hasBeenIssuedAndAcknowledged: null,
  issueDate: null,
};

describe('generateClonedFacility', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('clones an issued facility correctly', () => {
    // Act
    const result = generateClonedFacility({ facility: issuedFacility, newDealId, auditDetails: mockAuditDetails });

    // Assert
    expect(result).toEqual({
      ...issuedFacility,
      _id: expect.any(ObjectId) as ObjectId,
      dealId: new ObjectId(newDealId),
      type: FACILITY_TYPE.CASH,
      hasBeenIssued: false,
      shouldCoverStartOnSubmission: true,
      coverStartDate: null,
      issueDate: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      submittedAsIssuedDate: null,
      ukefFacilityId: null,
      coverDateConfirmed: null,
      canResubmitIssuedFacilities: null,
      hasBeenIssuedAndAcknowledged: null,
      unissuedToIssuedByMaker: {},
      auditRecord: generateAuditDatabaseRecordFromAuditDetails(mockAuditDetails),
      isUsingFacilityEndDate: null,
      facilityEndDate: null,
      bankReviewDate: null,
    });
  });

  it('clones an unissued facility correctly', () => {
    // Act
    const result = generateClonedFacility({ facility: unissuedFacility, newDealId, auditDetails: mockAuditDetails });

    // Assert
    expect(result).toEqual({
      ...unissuedFacility,
      _id: expect.any(ObjectId) as ObjectId,
      dealId: new ObjectId(newDealId),
      type: FACILITY_TYPE.CASH,
      hasBeenIssued: true,
      issueDate: null,
      monthsOfCover: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      submittedAsIssuedDate: null,
      ukefFacilityId: null,
      coverDateConfirmed: null,
      canResubmitIssuedFacilities: null,
      hasBeenIssuedAndAcknowledged: null,
      unissuedToIssuedByMaker: {},
      auditRecord: generateAuditDatabaseRecordFromAuditDetails(mockAuditDetails),
      isUsingFacilityEndDate: null,
      facilityEndDate: null,
      bankReviewDate: null,
    });
  });
});
