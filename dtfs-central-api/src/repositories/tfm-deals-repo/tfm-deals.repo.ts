import { Collection, ObjectId, UpdateResult, WithoutId } from 'mongodb';
import { AuditDetails, DealNotFoundError, InvalidDealIdError, MONGO_DB_COLLECTIONS, TfmDeal } from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { flatten } from 'mongo-dot-notation';
import { mongoDbClient } from '../../drivers/db-client';

export class TfmDealRepo {
  private static async getCollection(): Promise<Collection<WithoutId<TfmDeal>>> {
    return await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.TFM_DEALS);
  }

  /**
   * Updates the deal tfm object
   * @param dealId - The deal id
   * @param update - The deal update to apply
   * @param auditDetails - The users audit details
   * @returns The update result
   */
  public static async updateOneDeal(dealId: string | ObjectId, update: Partial<TfmDeal>, auditDetails: AuditDetails): Promise<UpdateResult> {
    if (!ObjectId.isValid(dealId)) {
      throw new InvalidDealIdError(dealId.toString());
    }

    const dealCollection = await this.getCollection();

    const updateResult = await dealCollection.updateOne(
      {
        _id: { $eq: new ObjectId(dealId) },
      },
      flatten({
        ...update,
        auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
      }),
    );

    if (!updateResult?.matchedCount) {
      throw new DealNotFoundError(dealId.toString());
    }

    return updateResult;
  }
}
