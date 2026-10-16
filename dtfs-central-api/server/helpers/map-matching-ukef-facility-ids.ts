/**
 * Maps the UKEF facility IDs from the TFM facilities repository to a boolean indicating whether they match or not.
 * @param matchingGefFacilityIdDocuments - The documents from the TFM facilities repository that have matching GEF facility IDs.
 * @param ukefFacilityIds - The UKEF facility IDs to check.
 * @returns A record mapping each UKEF facility ID to a boolean indicating whether a matching GEF facility exists.
 */
export const mapMatchingUkefFacilityIds = (
  matchingGefFacilityIdDocuments: { facilitySnapshot: { ukefFacilityId: string | null } }[],
  ukefFacilityIds: string[],
): Record<string, boolean> => {
  // Create a set of matched UKEF facility IDs from the documents returned by the TFM facilities repository
  const matchedIds = new Set(matchingGefFacilityIdDocuments.map((doc) => doc.facilitySnapshot.ukefFacilityId));

  // Create a record mapping each UKEF facility ID to a boolean indicating whether a matching GEF facility exists
  return ukefFacilityIds.reduce<Record<string, boolean>>((acc, id) => {
    const accumulated = acc;

    accumulated[id] = matchedIds.has(id);

    return accumulated;
  }, {});
};
