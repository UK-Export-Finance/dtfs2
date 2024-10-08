import { TfmFacility } from '@ukef/dtfs2-common';
import { mongoDbClient } from '../database-client';

/**
 * Gets the unique tfm facilities UKEF facility ids
 * @returns The unique tfm facilities ukef facility ids
 */
export const getUniqueTfmFacilitiesUkefFacilityIds = async (): Promise<string[]> => {
  const tfmFacilitiesCollection = await mongoDbClient.getCollection('tfm-facilities');
  const ukefFacilityIds = await tfmFacilitiesCollection
    .find({})
    .project<TfmFacility>({ 'facilitySnapshot.ukefFacilityId': 1, _id: 0 })
    .map(({ facilitySnapshot }) => facilitySnapshot.ukefFacilityId)
    .toArray();

  const uniqueUkefFacilityIds = ukefFacilityIds.reduce((set, ukefFacilityId) => (ukefFacilityId === null ? set : set.add(ukefFacilityId)), new Set<string>());
  return Array.from(uniqueUkefFacilityIds);
};
