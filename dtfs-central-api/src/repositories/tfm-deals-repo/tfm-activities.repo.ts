import { Collection, ObjectId, WithoutId, UpdateFilter } from 'mongodb';
import { AuditDetails, DealNotFoundError, InvalidDealIdError, MONGO_DB_COLLECTIONS, TfmActivity, TfmDeal } from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { mongoDbClient } from '../../drivers/db-client';

export class TfmActivitiesRepo {
  /**
   * gets deal collection from the database
   * @returns deal collection
   */
  private static async getDealCollection(): Promise<Collection<WithoutId<TfmDeal>>> {
    return await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.TFM_DEALS);
  }

  /**
   * Submits the deal cancellation and updates the respective deal stage
   * @param params
   * @param params.dealId - The deal id
   * @param params.cancellation - The deal cancellation details to submit
   * @param params.activity - Object to add to the activities array
   * @param params.auditDetails - The users audit details
   */
  public static async submitTfmActivity({
    dealId,
    activity,
    auditDetails,
  }: {
    dealId: string | ObjectId;
    activity?: TfmActivity;
    auditDetails: AuditDetails;
  }): Promise<{ deal: TfmDeal | null }> {
    try {
      if (!ObjectId.isValid(dealId)) {
        throw new InvalidDealIdError(dealId.toString());
      }

      const dealCollection = await this.getDealCollection();

      const update: UpdateFilter<WithoutId<TfmDeal>> = {
        $set: {
          auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
        },
      };

      if (activity) {
        update.$push = {
          'tfm.activities': activity,
        };
      }

      const { value: deal } = await dealCollection.findOneAndUpdate(
        {
          _id: { $eq: new ObjectId(dealId) },
        },
        update,
      );

      if (!deal) {
        throw new DealNotFoundError(dealId.toString());
      }

      return { deal };
    } catch (error) {
      console.error('Error submitting tfm activity %o', error);
      throw error;
    }
  }
}
