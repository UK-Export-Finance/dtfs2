import { Facility, FACILITY_TYPE } from '@ukef/dtfs2-common';
import { Collection, ObjectId } from 'mongodb';
import { generateAuditDatabaseRecordFromAuditDetails, generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { cloneFacilities } from './clone-facilities.service';
import { mongoDbClient } from '../../../drivers/db-client';

const existingDealId = new ObjectId().toString();
const newDealId = new ObjectId();
const mockAuditDetails = generateSystemAuditDetails();

const facilities: Facility[] = [
  {
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
  },
  {
    _id: new ObjectId(),
    dealId: new ObjectId(existingDealId),
    type: FACILITY_TYPE.CASH,
    hasBeenIssued: true,
    name: 'Facility two',
    shouldCoverStartOnSubmission: true,
    coverStartDate: new Date(1638403200000),
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
  },
];

describe('cloneFacilities', () => {
  let facilitiesCollection: Collection<Facility>;
  const findMock = jest.fn();
  const findToArrayMock = jest.fn();
  const insertManyMock = jest.fn();

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    findToArrayMock.mockResolvedValue(facilities);
    findMock.mockReturnValue({ toArray: findToArrayMock });

    facilitiesCollection = {
      insertMany: insertManyMock,
      find: findMock,
    } as unknown as Collection<Facility>;

    const getCollectionMock = jest.fn().mockResolvedValue(facilitiesCollection);

    jest.spyOn(mongoDbClient, 'getCollection').mockImplementation(getCollectionMock);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('gets existing facilities', async () => {
    // Act
    await cloneFacilities(existingDealId, newDealId, mockAuditDetails);

    // Assert
    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith({
      dealId: { $eq: new ObjectId(existingDealId) },
    });
  });

  it('does not insert facilities when there are none on existing deal', async () => {
    // Arrange
    findToArrayMock.mockResolvedValueOnce([]);

    // Act
    await cloneFacilities(existingDealId, newDealId, mockAuditDetails);

    // Assert
    expect(insertManyMock).toHaveBeenCalledTimes(0);
  });

  it('inserts mapped facilities', async () => {
    // Arrange
    findToArrayMock.mockResolvedValueOnce(facilities);

    // Act
    await cloneFacilities(existingDealId, newDealId, mockAuditDetails);

    // Assert
    expect(insertManyMock).toHaveBeenCalledTimes(1);
    expect(insertManyMock).toHaveBeenCalledWith([
      {
        dealId: new ObjectId(newDealId),
        type: FACILITY_TYPE.CASH,
        hasBeenIssued: false,
        name: 'Facility one',
        shouldCoverStartOnSubmission: true,
        coverStartDate: null,
        coverEndDate: '2030-01-01T00:00:00.000Z',
        issueDate: null,
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
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ukefExposure: 1600,
        guaranteeFee: 0.9,
        submittedAsIssuedDate: null,
        feeType: 'In advance',
        feeFrequency: 'Monthly',
        ukefFacilityId: null,
        dayCountBasis: 365,
        coverDateConfirmed: null,
        canResubmitIssuedFacilities: null,
        hasBeenIssuedAndAcknowledged: null,
        unissuedToIssuedByMaker: {},
        auditRecord: generateAuditDatabaseRecordFromAuditDetails(mockAuditDetails),
      },
      {
        dealId: new ObjectId(newDealId),
        type: FACILITY_TYPE.CASH,
        hasBeenIssued: true,
        name: 'Facility two',
        shouldCoverStartOnSubmission: true,
        coverStartDate: null,
        coverEndDate: '2030-01-01T00:00:00.000Z',
        issueDate: null,
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
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ukefExposure: 1600,
        guaranteeFee: 0.9,
        submittedAsIssuedDate: null,
        ukefFacilityId: null,
        feeType: 'In advance',
        feeFrequency: 'Monthly',
        dayCountBasis: 365,
        coverDateConfirmed: null,
        canResubmitIssuedFacilities: null,
        hasBeenIssuedAndAcknowledged: null,
        unissuedToIssuedByMaker: {},
        auditRecord: generateAuditDatabaseRecordFromAuditDetails(mockAuditDetails),
      },
    ]);
  });
});
