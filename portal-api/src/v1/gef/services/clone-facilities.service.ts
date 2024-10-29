import { ObjectId } from 'mongodb';
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

  // get all existing facilities
  const allFacilities = (await collection
    .find({
      dealId: { $eq: new ObjectId(currentDealId) },
    })
    .toArray()) as Partial<Facility>[];

  // check if there are any facilities in the db
  if (allFacilities.length) {
    Object.entries(allFacilities).forEach((value, index) => {
      // delete the existing `_id` property - this will be re-created when a new deal is inserted
      delete allFacilities[index]._id;

      // updated the `dealId` property to match the new application ID
      allFacilities[index].dealId = new ObjectId(newDealId);
      // update the `createdAt` property to match the current time in EPOCH format
      allFacilities[index].createdAt = Date.now();
      // update the `updatedAt` property to match the current time in EPOCH format
      allFacilities[index].updatedAt = Date.now();
      // reset the ukefFacilityId
      allFacilities[index].ukefFacilityId = null;
      // reset canResubmitIssuedFacilities to null
      allFacilities[index].canResubmitIssuedFacilities = null;
      // reset issueDate to null
      allFacilities[index].issueDate = null;
      // reset coverDateConfirmed to null
      allFacilities[index].coverDateConfirmed = null;
      // reset coverDateConfirmed to null
      allFacilities[index].unissuedToIssuedByMaker = {};
      allFacilities[index].hasBeenIssuedAndAcknowledged = null;
      allFacilities[index].submittedAsIssuedDate = null;
      allFacilities[index].auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

      const currentTime = new Date();
      currentTime.setHours(0, 0, 0, 0);

      if (allFacilities[index].coverStartDate) {
        const difference = currentTime.valueOf() - new Date(allFacilities[index].coverStartDate).getTime();
        // check if the coverStartDate is in the past
        if (difference > 0) {
          // if it is, then ask the user to update it
          allFacilities[index].coverStartDate = null;
        }
      }
    });
    await collection.insertMany(allFacilities as Facility[]);
  }
};
