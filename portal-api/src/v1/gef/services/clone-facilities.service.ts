import { ObjectId } from 'mongodb';
import { produce } from 'immer';
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
    /* eslint-disable no-param-reassign */
    return produce(facility, (draftFacility) => {
      delete draftFacility._id;

      draftFacility.dealId = new ObjectId(newDealId);
      draftFacility.createdAt = Date.now();
      draftFacility.updatedAt = Date.now();
      draftFacility.ukefFacilityId = null;
      draftFacility.canResubmitIssuedFacilities = null;
      draftFacility.issueDate = null;
      draftFacility.coverDateConfirmed = null;
      draftFacility.unissuedToIssuedByMaker = {};
      draftFacility.hasBeenIssuedAndAcknowledged = null;
      draftFacility.submittedAsIssuedDate = null;
      draftFacility.auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

      const currentTime = new Date();
      currentTime.setHours(0, 0, 0, 0);

      if (draftFacility.coverStartDate) {
        const difference = currentTime.valueOf() - new Date(draftFacility.coverStartDate).getTime();
        // check if the coverStartDate is in the past
        if (difference > 0) {
          // if it is, then ask the user to update it
          draftFacility.coverStartDate = null;
        }
      }
    });
    /* eslint-enable no-param-reassign */
  }) as Facility[];
  await collection.insertMany(clonedFacilities);
};
