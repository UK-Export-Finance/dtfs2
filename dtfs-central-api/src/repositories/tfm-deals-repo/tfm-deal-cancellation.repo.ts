import { Collection, ObjectId, UpdateFilter, UpdateResult, WithoutId } from 'mongodb';
import { DEAL_SUBMISSION_TYPE, DealNotFoundError, MONGO_DB_COLLECTIONS, TFM_DEAL_STAGE, TfmDeal, TfmDealCancellation } from '@ukef/dtfs2-common';
import { mongoDbClient } from '../../drivers/db-client';

export class TfmDealCancellationRepo {
  private static async getCollection(): Promise<Collection<WithoutId<TfmDeal>>> {
    return await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.TFM_DEALS);
  }

  /**
   * Finds the cancellation by dealId
   * @param dealId - The deal id
   * @returns the found deal cancellation
   */
  public static async findDealCancellationByDealId(dealId: string | ObjectId): Promise<TfmDealCancellation> {
    const dealCollection = await this.getCollection();
    const matchingDeal = await dealCollection.findOne({
      _id: { $eq: new ObjectId(dealId) },
      'dealSnapshot.submissionType': { $in: [DEAL_SUBMISSION_TYPE.AIN, DEAL_SUBMISSION_TYPE.MIN] },
    });

    if (!matchingDeal) {
      throw new DealNotFoundError(dealId.toString());
    }

    return matchingDeal.tfm.cancellation;
  }

  /**
   * Updates the deal tfm object with the supplied cancellation
   * @param dealId - The deal id
   * @param update - The deal cancellation update to apply
   * @returns The update result
   */
  public static async updateOneDealCancellation(dealId: string | ObjectId, update: UpdateFilter<TfmDealCancellation>): Promise<UpdateResult> {
    const dealCollection = await this.getCollection();

    const updateResult = await dealCollection.updateOne(
      {
        _id: { $eq: new ObjectId(dealId) },
        'tfm.stage': { $ne: TFM_DEAL_STAGE.CANCELLED },
        'dealSnapshot.submissionType': { $in: [DEAL_SUBMISSION_TYPE.AIN, DEAL_SUBMISSION_TYPE.MIN] },
      },
      update,
    );

    if (!updateResult?.matchedCount) {
      throw new DealNotFoundError(dealId.toString());
    }

    return updateResult;
  }
}
