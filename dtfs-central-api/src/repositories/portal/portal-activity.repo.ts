import { Collection, ObjectId, WithoutId, UpdateResult } from 'mongodb';
import { AuditDetails, Deal, InvalidDealIdError, MONGO_DB_COLLECTIONS, PortalActivity } from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { mongoDbClient } from '../../drivers/db-client';

export class PortalActivityRepo {
  private static async getDealCollection(): Promise<Collection<WithoutId<Deal>>> {
    return await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.DEALS);
  }

  /**
   * Add an activity to a deal (currently GEF only)
   * @param dealId - the deal ID
   * @param newActivity - the new activity to add
   * @param auditDetails - the users audit details
   */
  public static async addPortalActivity(dealId: string | ObjectId, newActivity: PortalActivity, auditDetails: AuditDetails): Promise<UpdateResult> {
    if (!ObjectId.isValid(dealId)) {
      throw new InvalidDealIdError(dealId.toString());
    }

    const collection = await this.getDealCollection();

    const auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

    return await collection.updateOne(
      { _id: { $eq: dealId } },
      {
        $push: {
          portalActivities: { $each: [newActivity], $position: 0 },
        },
        $set: { auditRecord },
      },
    );
  }
}
