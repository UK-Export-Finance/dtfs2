import { ObjectId } from 'mongodb';
import {
  AuditDetails,
  Bank,
  getCurrentGefDealVersion,
  PortalSessionUser,
  GefDeal,
  MONGO_DB_COLLECTIONS,
  InvalidDealIdError,
  InvalidParameterError,
  DealNotFoundError,
} from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { mongoDbClient } from '../../../drivers/db-client';
import { getLatestEligibilityCriteria } from '../controllers/eligibilityCriteria.controller';
import { DEAL } from '../../../constants';
import { cloneExporter } from './clone-exporter.service';

type CloneDealParams = {
  dealId: string | ObjectId;
  bankInternalRefName: string;
  additionalRefName: string;
  maker: PortalSessionUser;
  userId: string | ObjectId;
  bank: Bank;
  auditDetails: AuditDetails;
};

export const cloneDeal = async ({
  dealId,
  bankInternalRefName,
  additionalRefName,
  maker,
  userId,
  bank,
  auditDetails,
}: CloneDealParams): Promise<{ insertedId: ObjectId }> => {
  if (!ObjectId.isValid(dealId)) {
    throw new InvalidDealIdError(String(dealId));
  }

  if (typeof bank.id !== 'string') {
    throw new InvalidParameterError('bank.id', bank.id);
  }

  const collection = await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.DEALS);

  const propertiesToRemove = [
    '_id',
    'ukefDecision',
    'ukefDecisionAccepted',
    'checkerMIN',
    'manualInclusionNoticeSubmissionDate',
    'comments',
    'previousStatus',
    'dataMigration',
  ];

  // get the current GEF deal
  const existingDeal = (await collection.findOne({ _id: { $eq: new ObjectId(dealId) }, 'bank.id': { $eq: bank.id } })) as GefDeal | null;

  if (!existingDeal) {
    throw new DealNotFoundError(String(dealId));
  }

  const clonedDeal = existingDeal;
  const eligibility = await getLatestEligibilityCriteria();

  propertiesToRemove.forEach((property) => {
    if (clonedDeal[property]) {
      delete clonedDeal[property];
    }
  });

  clonedDeal.version = getCurrentGefDealVersion();
  clonedDeal.createdAt = Date.now();
  clonedDeal.updatedAt = Date.now();
  clonedDeal.facilitiesUpdated = Date.now();
  clonedDeal.eligibility = eligibility;
  clonedDeal.eligibility.updatedAt = Date.now();
  clonedDeal.status = DEAL.DEAL_STATUS.DRAFT;
  clonedDeal.submissionType = null;
  clonedDeal.submissionDate = null;
  clonedDeal.submissionCount = 0;
  clonedDeal.bankInternalRefName = bankInternalRefName;
  clonedDeal.additionalRefName = additionalRefName;
  clonedDeal.maker = maker;
  clonedDeal.bank = bank;
  clonedDeal.ukefDealId = null;
  clonedDeal.checkerId = null;
  clonedDeal.editedBy = [userId];
  clonedDeal.exporter = cloneExporter(clonedDeal.exporter);
  clonedDeal.portalActivities = [];
  clonedDeal.supportingInformation = {};
  clonedDeal.clonedDealId = dealId;
  clonedDeal.auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

  const createdApplication = await collection.insertOne(clonedDeal);
  const newDealId = createdApplication.insertedId;

  // return the ID for the newly inserted deal
  return { insertedId: newDealId };
};
