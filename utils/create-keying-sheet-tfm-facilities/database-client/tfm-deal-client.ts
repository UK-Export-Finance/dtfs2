import { Collection, WithoutId } from 'mongodb';
import { AnyObject } from '@ukef/dtfs2-common';
import { mongoDbClient } from './mongo-db-client';

// This should be replaced by a more complete TfmDeal type should one get created
export type TfmDeal = AnyObject & { dealSnapshot: AnyObject & { ukefDealId: string } };

export class TfmDealClient {
  private static collection?: Collection<WithoutId<TfmDeal>>;

  public static async init(): Promise<void> {
    this.collection = await mongoDbClient.getCollection('tfm-deals');
  }

  public static async insertIfNotExists(tfmDeal: TfmDeal): Promise<void> {
    if (!this.collection) {
      throw new Error('Tfm deal client has not yet been initialised');
    }

    const { ukefDealId } = tfmDeal.dealSnapshot;

    const numberOfDeals = await this.collection.count({ 'dealSnapshot.ukefDealId': { $eq: ukefDealId } });
    if (numberOfDeals !== 0) {
      console.info(`Tfm deal with ukef deal id '${ukefDealId}' already exists`);
      return;
    }

    console.info(`Inserting tfm deal with ukef deal id '${ukefDealId}'`);
    await this.collection.insertOne(tfmDeal);
  }
}
