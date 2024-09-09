import { Collection, Document, ObjectId, UpdateFilter, UpdateResult, WithoutId } from 'mongodb';
import { DealNotFoundError, TfmDeal, TfmDealCancellation } from '@ukef/dtfs2-common';
import { mongoDbClient } from '../../drivers/db-client';

export class TfmDealCancellationRepo {
  private static async getCollection(): Promise<Collection<WithoutId<TfmDeal>>> {
    return await mongoDbClient.getCollection('tfm-deals');
  }

  /**
   * Finds the cancellation by dealId
   * @param dealId - The deal id
   * @returns the found deal cancellation
   */
  public static async findDealCancellationByDealId(dealId: string | ObjectId): Promise<Document> {
    const dealCollection = await this.getCollection();
    const matchingDeal = await dealCollection.findOne({ _id: { $eq: new ObjectId(dealId) } });

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
  public static async updateOneDealWithCancellation(dealId: string | ObjectId, update: UpdateFilter<TfmDealCancellation>): Promise<UpdateResult> {
    const dealCollection = await this.getCollection();

    const matchingDeal = await dealCollection.findOne({ _id: { $eq: new ObjectId(dealId) } });

    if (!matchingDeal) {
      throw new DealNotFoundError(dealId.toString());
    }

    return await dealCollection.updateOne(
      {
        _id: { $eq: new ObjectId(dealId) },
      },
      update,
    );
  }
}
