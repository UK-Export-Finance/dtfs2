import { ObjectId } from 'mongodb';
import {
  AuditDetails,
  Bank,
  PortalSessionUser,
  GefDeal,
  MONGO_DB_COLLECTIONS,
  InvalidDealIdError,
  InvalidParameterError,
  DealNotFoundError,
} from '@ukef/dtfs2-common';
import { mongoDbClient } from '../../../../drivers/db-client';
import { getLatestEligibilityCriteria } from '../../controllers/eligibilityCriteria.controller';
import { generateClonedDeal } from './helpers/generate-cloned-deal';

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
 * Creates a copy of existing GEF deal.
 * Inserts a clone into the database as the latest version.
 * Updates/removes certain values.
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

  const latestEligibilityCriteria = await getLatestEligibilityCriteria();

  const clonedDeal = generateClonedDeal({
    existingDeal,
    latestEligibilityCriteria,
    bankInternalRefName,
    additionalRefName,
    maker,
    bank,
    userId,
    dealId,
    auditDetails,
  });

  const createdApplication = await collection.insertOne(clonedDeal);
  const newDealId = createdApplication.insertedId;

  // return the ID for the newly inserted deal
  return { insertedId: newDealId };
};
