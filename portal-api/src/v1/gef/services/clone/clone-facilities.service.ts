import { ObjectId } from 'mongodb';
import { AuditDetails, Facility } from '@ukef/dtfs2-common';
import { mongoDbClient } from '../../../../drivers/db-client';
import { generateClonedFacility } from './helpers/generate-cloned-facility';

/**
 * Clones the existing facilities, removing/updating fields
 * @param currentDealId - the existing deal id
 * @param newDealId - the new deal id
 * @param auditDetails - the users audit details
 * @returns void
 */
export const cloneFacilities = async (currentDealId: string, newDealId: ObjectId, auditDetails: AuditDetails): Promise<void> => {
  const facilitiesCollection = 'facilities';
  const collection = await mongoDbClient.getCollection(facilitiesCollection);

  const existingFacilities = (await collection
    .find({
      dealId: { $eq: new ObjectId(currentDealId) },
    })
    .toArray()) as Partial<Facility>[];

  if (!existingFacilities.length) {
    return;
  }

  const clonedFacilities = existingFacilities.map((facility) => generateClonedFacility({ facility, newDealId, auditDetails }));

  await collection.insertMany(clonedFacilities);
};
