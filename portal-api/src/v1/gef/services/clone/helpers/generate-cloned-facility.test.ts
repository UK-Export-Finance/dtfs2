import { CURRENCY, Facility, FACILITY_TYPE } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { add } from 'date-fns';
import { generateAuditDatabaseRecordFromAuditDetails, generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { generateClonedFacility } from './generate-cloned-facility';

const existingDealId = new ObjectId().toString();
const newDealId = new ObjectId();
const mockAuditDetails = generateSystemAuditDetails();

const facilityDefaults = {
  dealId: new ObjectId(existingDealId),
  type: FACILITY_TYPE.CASH,
  shouldCoverStartOnSubmission: true,
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
  currency: { id: CURRENCY.GBP },
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
  dayCountBasis: 365,
  canResubmitIssuedFacilities: null,
  hasBeenIssuedAndAcknowledged: null,
  issueDate: null,
};

const issuedFacility: Facility = {
  ...facilityDefaults,
  _id: new ObjectId(),
  hasBeenIssued: false,
  name: 'Facility one',
  coverStartDate: new Date(1638403200000),
  ukefFacilityId: '10000011',
  coverDateConfirmed: null,
};

const unissuedFacility: Facility = {
  ...facilityDefaults,
  _id: new ObjectId(),
  hasBeenIssued: true,
  name: 'Facility two',
  coverStartDate: add(new Date(), { days: 1 }),
  monthsOfCover: null,
  ukefFacilityId: '10000012',
  coverDateConfirmed: true,
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
