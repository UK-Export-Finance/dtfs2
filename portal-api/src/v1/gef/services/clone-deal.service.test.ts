import { aPortalSessionUser, Bank, Deal, DEAL_STATUS, getCurrentGefDealVersion } from '@ukef/dtfs2-common';
import { Collection, ObjectId } from 'mongodb';
import { generateAuditDatabaseRecordFromAuditDetails, generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { cloneDeal } from './clone-deal.service';
import { mongoDbClient } from '../../../drivers/db-client';
import { cloneExporter } from './clone-exporter.service';

const mockLatestEligibilityCriteria = {
  eligibility: 'criteria',
};

jest.mock('../controllers/eligibilityCriteria.controller', () => ({
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

describe('cloneDeal', () => {
  let dealsCollection: Collection<Deal>;
  const findOneMock = jest.fn();
  const insertOneMock = jest.fn();

  beforeAll(() => {
    jest.useFakeTimers();
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

  afterAll(() => {
    jest.useRealTimers();
  });

  it('gets existing deal', async () => {
    // Act
    await cloneDeal({
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
    await cloneDeal({
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
      dealType: existingDeal.dealType,
      version: getCurrentGefDealVersion(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      facilitiesUpdated: Date.now(),
      eligibility: {
        ...mockLatestEligibilityCriteria,
        updatedAt: Date.now(),
      },
      status: DEAL_STATUS.DRAFT,
      submissionType: null,
      submissionDate: null,
      submissionCount: 0,
      bankInternalRefName,
      additionalRefName,
      maker,
      bank: mockBank,
      ukefDealId: null,
      checkerId: null,
      editedBy: [maker._id],
      exporter: cloneExporter(existingDeal.exporter),
      portalActivities: [],
      supportingInformation: {},
      clonedDealId: existingDealId,
      auditRecord: generateAuditDatabaseRecordFromAuditDetails(mockAuditDetails),
    });
  });
});
