import { Collection, WithoutId, ObjectId, UpdateResult } from 'mongodb';
import { AuditDetails, DealNotFoundError, InvalidDealIdError, MONGO_DB_COLLECTIONS, TfmActivity, TfmDeal } from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { mongoDbClient } from '../../drivers/db-client';

export class TfmDealActivityRepo {
  private static async getCollection(): Promise<Collection<WithoutId<TfmDeal>>> {
    return await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.TFM_DEALS);
  }

  /**
   * Pushes the new activity to the activities array
   * @param dealId - The deal id
   * @param activity- The deal activity
   * @param auditDetails - The users audit details
   * @returns The update result
   */
  public static async addOneDealActivity(dealId: string | ObjectId, activity: TfmActivity, auditDetails: AuditDetails): Promise<UpdateResult> {
    if (!ObjectId.isValid(dealId)) {
      throw new InvalidDealIdError(dealId.toString());
    }

    const dealCollection = await this.getCollection();

    const updateResult = await dealCollection.updateOne(
      {
        _id: { $eq: new ObjectId(dealId) },
      },
      {
        $push: {
          'tfm.activities': activity,
        },
        $set: {
          auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
        },
      },
    );

    if (!updateResult?.matchedCount) {
      throw new DealNotFoundError(dealId.toString());
    }

    return updateResult;
  }
}
