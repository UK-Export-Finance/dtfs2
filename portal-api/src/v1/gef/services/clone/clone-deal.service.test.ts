import { aPortalSessionUser, Bank, Deal, DEAL_STATUS, DealNotFoundError, InvalidDealIdError, InvalidParameterError } from '@ukef/dtfs2-common';
import { Collection, ObjectId } from 'mongodb';
import { generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { cloneDealToLatestVersion } from './clone-deal.service';
import { mongoDbClient } from '../../../../drivers/db-client';
import { generateClonedDeal } from './helpers/generate-cloned-deal';

const mockLatestEligibilityCriteria = {
  eligibility: 'criteria',
};

jest.mock('../../controllers/eligibilityCriteria.controller', () => ({
  getLatestEligibilityCriteria: jest.fn(() => mockLatestEligibilityCriteria),
}));

const existingDealId = new ObjectId().toString();
const mockAuditDetails = generateSystemAuditDetails();
const mockBank = {
  id: 'bank id',
} as Bank;
const bankInternalRefName = 'bankInternalRefName';
const additionalRefName = 'additionalRefName';
const maker = aPortalSessionUser();

const existingDeal: Deal = {
  _id: new ObjectId(existingDealId),
  version: 0,
  dealType: 'GEF',
  ukefDealId: 'UkefDealId',
  eligibility: {},
  exporter: {},
  createdAt: Date.now(),
  updatedAt: Date.now(),
  facilitiesUpdated: Date.now(),
  status: DEAL_STATUS.UKEF_ACKNOWLEDGED,
  submissionType: null,
  submissionDate: null,
  submissionCount: 0,
  bankInternalRefName: 'oldBankInternalRefName',
  additionalRefName: 'oldAdditionalRefName',
  maker: {},
  bank: {},
  checkerId: 'checker id',
  editedBy: ['a user id', 'another user id'],
  portalActivities: ['An activity'],
  supportingInformation: {
    information: 'information',
  },
  auditRecord: {},
  ukefDecision: 'ukefDecision',
  ukefDecisionAccepted: 'ukefDecisionAccepted',
  checkerMIN: 'checkerMIN',
  manualInclusionNoticeSubmissionDate: 'manualInclusionNoticeSubmissionDate',
  comments: 'comments',
  previousStatus: 'previousStatus',
  dataMigration: 'dataMigration',
};

describe('cloneDealToLatestVersion', () => {
  let dealsCollection: Collection<Deal>;
  const findOneMock = jest.fn();
  const insertOneMock = jest.fn();

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    findOneMock.mockResolvedValue(existingDeal);
    insertOneMock.mockResolvedValue({ insertedId: new ObjectId() });

    dealsCollection = {
      insertOne: insertOneMock,
      findOne: findOneMock,
    } as unknown as Collection<Deal>;

    const getCollectionMock = jest.fn().mockResolvedValue(dealsCollection);

    jest.spyOn(mongoDbClient, 'getCollection').mockImplementation(getCollectionMock);
  });

  it('throws InvalidDealIdError when the dealId is not an ObjectId', async () => {
    // Arrange
    const invalidDealId = 'dealId';

    // Act & Assert
    await expect(() =>
      cloneDealToLatestVersion({
        dealId: invalidDealId,
        bankInternalRefName,
        additionalRefName,
        maker,
        userId: maker._id,
        bank: mockBank,
        auditDetails: mockAuditDetails,
      }),
    ).rejects.toThrow(new InvalidDealIdError(invalidDealId));
  });

  it('throws InvalidParameterError when the bank id is not a string', async () => {
    // Arrange
    const bankId = 123;

    // Act & Assert
    await expect(() =>
      cloneDealToLatestVersion({
        dealId: existingDealId,
        bankInternalRefName,
        additionalRefName,
        maker,
        userId: maker._id,
        bank: { id: bankId } as unknown as Bank,
        auditDetails: mockAuditDetails,
      }),
    ).rejects.toThrow(new InvalidParameterError('bank.id', bankId));
  });

  it('throws DealNotFoundError when the dealId is valid but does not correspond to a deal', async () => {
    // Arrange
    findOneMock.mockResolvedValueOnce(null);

    // Act & Assert
    await expect(() =>
      cloneDealToLatestVersion({
        dealId: existingDealId,
        bankInternalRefName,
        additionalRefName,
        maker,
        userId: maker._id,
        bank: mockBank,
        auditDetails: mockAuditDetails,
      }),
    ).rejects.toThrow(new DealNotFoundError(existingDealId));
  });

  it('gets existing deal', async () => {
    // Act
    await cloneDealToLatestVersion({
      dealId: existingDealId,
      bankInternalRefName,
      additionalRefName,
      maker,
      userId: maker._id,
      bank: mockBank,
      auditDetails: mockAuditDetails,
    });

    // Assert
    expect(findOneMock).toHaveBeenCalledTimes(1);
    expect(findOneMock).toHaveBeenCalledWith({ _id: { $eq: new ObjectId(existingDealId) }, 'bank.id': { $eq: mockBank.id } });
  });

  it('inserts a cloned deal', async () => {
    // Act
    await cloneDealToLatestVersion({
      dealId: existingDealId,
      bankInternalRefName,
      additionalRefName,
      maker,
      userId: maker._id,
      bank: mockBank,
      auditDetails: mockAuditDetails,
    });

    // Assert
    expect(insertOneMock).toHaveBeenCalledTimes(1);
    expect(insertOneMock).toHaveBeenCalledWith({
      ...generateClonedDeal({
        dealId: existingDealId,
        bankInternalRefName,
        additionalRefName,
        maker,
        userId: maker._id,
        bank: mockBank,
        auditDetails: mockAuditDetails,
        existingDeal,
        latestEligibilityCriteria: mockLatestEligibilityCriteria,
      }),
      _id: expect.any(ObjectId) as ObjectId,
    });
  });
});
