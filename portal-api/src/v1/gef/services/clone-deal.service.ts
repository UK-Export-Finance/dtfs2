import { ObjectId } from 'mongodb';
import { produce } from 'immer';
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

const propertiesToRemove = [
  'ukefDecision',
  'ukefDecisionAccepted',
  'checkerMIN',
  'manualInclusionNoticeSubmissionDate',
  'comments',
  'previousStatus',
  'dataMigration',
];

type CloneDealParams = {
  dealId: string | ObjectId;
  bankInternalRefName: string;
  additionalRefName: string;
  maker: PortalSessionUser;
  userId: string | ObjectId;
  bank: Bank;
  auditDetails: AuditDetails;
};

/**
 * Creates a copy of existing GEF deal & inserts a clone into the database, with certain values updated/removed.
 *
 * @param params 
 * @param params.dealId - the deal ID
 * @param params.bankInternalRefName - the new deals internal ref name
 * @param params.additionalRefName - new new deals additional ref name
 * @param params.maker - the user making the clone
 * @param params.userId - the makers id
 * @param params.bank - the users bank
 * @param params.auditDetails - the users audit details

 * @returns the inserted deal id
 */
export const cloneDealToLatestVersion = async ({
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
  // get the current GEF deal
  const existingDeal = (await collection.findOne({ _id: { $eq: new ObjectId(dealId) }, 'bank.id': { $eq: bank.id } })) as GefDeal | null;

  if (!existingDeal) {
    throw new DealNotFoundError(String(dealId));
  }

  const eligibilityCriteria = await getLatestEligibilityCriteria();

  const clonedDeal = produce(existingDeal, (draft) => {
    propertiesToRemove.forEach((property) => {
      if (draft[property]) {
        delete draft[property];
      }
    });

    draft._id = new ObjectId();

    draft.version = getCurrentGefDealVersion();
    draft.createdAt = Date.now();
    draft.updatedAt = Date.now();
    draft.facilitiesUpdated = Date.now();
    draft.eligibility = { ...eligibilityCriteria, updatedAt: Date.now() };
    draft.status = DEAL.DEAL_STATUS.DRAFT;
    draft.submissionType = null;
    draft.submissionDate = null;
    draft.submissionCount = 0;
    draft.bankInternalRefName = bankInternalRefName;
    draft.additionalRefName = additionalRefName;
    draft.maker = maker;
    draft.bank = bank;
    draft.ukefDealId = null;
    draft.checkerId = null;
    draft.editedBy = [userId];
    draft.exporter = cloneExporter(draft.exporter);
    draft.portalActivities = [];
    draft.supportingInformation = {};
    draft.clonedDealId = dealId;
    draft.auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);
  });

  const createdApplication = await collection.insertOne(clonedDeal);
  const newDealId = createdApplication.insertedId;

  // return the ID for the newly inserted deal
  return { insertedId: newDealId };
};
