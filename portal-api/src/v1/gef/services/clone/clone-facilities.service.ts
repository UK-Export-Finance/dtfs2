import { ObjectId } from 'mongodb';
import { produce } from 'immer';
import { isBefore, startOfDay } from 'date-fns';
import { AuditDetails, Facility } from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { mongoDbClient } from '../../../../drivers/db-client';

/**
 * Generate a clone of the existing facility
 * Updates/removes certain values
 * @param param0
 * @param param0.facility - the existing facility
 * @param param0.newDealId - the new deal id
 * @param param0.auditDetails - the makers audit details
 * @returns a clone of the existing facility
 */
export const generateCloneFacility = ({
  facility,
  newDealId,
  auditDetails,
}: {
  facility: Partial<Facility>;
  newDealId: string | ObjectId;
  auditDetails: AuditDetails;
}): Facility =>
  produce(facility, (draft) => {
    draft._id = new ObjectId();

    draft.dealId = new ObjectId(newDealId);
    draft.createdAt = Date.now();
    draft.updatedAt = Date.now();
    draft.ukefFacilityId = null;
    draft.canResubmitIssuedFacilities = null;
    draft.issueDate = null;
    draft.coverDateConfirmed = null;
    draft.unissuedToIssuedByMaker = {};
    draft.hasBeenIssuedAndAcknowledged = null;
    draft.submittedAsIssuedDate = null;
    draft.auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

    draft.isUsingFacilityEndDate = null;
    draft.facilityEndDate = null;
    draft.bankReviewDate = null;

    const currentTime = new Date();
    currentTime.setHours(0, 0, 0, 0);

    if (draft.coverStartDate) {
      if (isBefore(new Date(draft.coverStartDate), startOfDay(new Date()))) {
        draft.coverStartDate = null;
      }
    }
  }) as Facility;

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

  const clonedFacilities = existingFacilities.map((facility) => generateCloneFacility({ facility, newDealId, auditDetails }));

  await collection.insertMany(clonedFacilities);
};
