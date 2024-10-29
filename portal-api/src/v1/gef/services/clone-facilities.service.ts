import { ObjectId } from 'mongodb';
import { produce } from 'immer';
import { isBefore, startOfDay } from 'date-fns';
import { AuditDetails, Facility } from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { mongoDbClient } from '../../../drivers/db-client';

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

  const clonedFacilities = existingFacilities.map((facility) => {
    return produce(facility, (draft) => {
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
        // check if the coverStartDate is in the past
        if (isBefore(new Date(draft.coverStartDate), startOfDay(new Date()))) {
          // if it is, then ask the user to update it
          draft.coverStartDate = null;
        }
      }
    }) as Facility;
  });

  await collection.insertMany(clonedFacilities);
};
