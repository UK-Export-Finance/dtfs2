import { ObjectId } from 'mongodb';
import { AuditDetails, Bank, getCurrentGefDealVersion, PortalSessionUser, GefDeal } from '@ukef/dtfs2-common';
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

export const cloneDeal = async ({ dealId, bankInternalRefName, additionalRefName, maker, userId, bank, auditDetails }: CloneDealParams) => {
  if (!ObjectId.isValid(dealId)) {
    return { status: 400, message: 'Invalid Deal Id' };
  }

  if (typeof bank.id !== 'string') {
    return { status: 400, message: 'Invalid Bank Id' };
  }

  const applicationCollection = 'deals';
  const collection = await mongoDbClient.getCollection(applicationCollection);
  // remove unused properties at the top of the Object (i.e. _id, ukefDecision, etc).
  // any additional fields that are located at the root of the object and that need removing can be added here
  const unusedProperties = [
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
  if (existingDeal) {
    const clonedDeal = existingDeal;
    const eligibility = await getLatestEligibilityCriteria();

    // delete unused properties
    unusedProperties.forEach((property) => {
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

    // insert the cloned deal in the database
    const createdApplication = await collection.insertOne(clonedDeal);
    const newDealId = createdApplication.insertedId;

    // return the ID for the newly inserted deal
    return { newDealId: newDealId.toHexString(), status: 200 };
  }
  return { status: 404 };
};
