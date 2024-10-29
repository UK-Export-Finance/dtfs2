import { ObjectId } from 'mongodb';
import { produce } from 'immer';
import { isBefore, startOfDay } from 'date-fns';
import { AuditDetails, Facility } from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { mongoDbClient } from '../../../drivers/db-client';

export const cloneFacilities = async (currentDealId: string, newDealId: ObjectId, auditDetails: AuditDetails) => {
  if (!ObjectId.isValid(currentDealId)) {
    throw new Error('Invalid Current Deal Id');
  }

  if (!ObjectId.isValid(newDealId)) {
    throw new Error('Invalid New Deal Id');
  }

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
      delete draft._id;

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

      const currentTime = new Date();
      currentTime.setHours(0, 0, 0, 0);

      if (draft.coverStartDate) {
        // check if the coverStartDate is in the past
        if (isBefore(new Date(draft.coverStartDate), startOfDay(new Date()))) {
          // if it is, then ask the user to update it
          draft.coverStartDate = null;
        }
      }
    });
  }) as Facility[];
  await collection.insertMany(clonedFacilities);
};
