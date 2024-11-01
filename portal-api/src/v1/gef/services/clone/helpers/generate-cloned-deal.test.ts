import { aPortalSessionUser, Bank, Deal, DEAL_STATUS, getCurrentGefDealVersion } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { generateAuditDatabaseRecordFromAuditDetails, generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { generateClonedExporter } from './generate-cloned-exporter';
import { generateClonedDeal } from './generate-cloned-deal';

const mockLatestEligibilityCriteria = {
  eligibility: 'criteria',
};

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

describe('generateClonedDeal', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('returns the expected clone deal', () => {
    // Act
    const cloneDeal = generateClonedDeal({
      dealId: existingDealId,
      bankInternalRefName,
      additionalRefName,
      maker,
      userId: maker._id,
      bank: mockBank,
      auditDetails: mockAuditDetails,
      existingDeal,
      latestEligibilityCriteria: mockLatestEligibilityCriteria,
    });

    // Assert
    expect(cloneDeal).toEqual({
      _id: expect.any(ObjectId) as ObjectId,
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
      exporter: generateClonedExporter(existingDeal.exporter),
      portalActivities: [],
      supportingInformation: {},
      clonedDealId: existingDealId,
      auditRecord: generateAuditDatabaseRecordFromAuditDetails(mockAuditDetails),
    });
  });
});
