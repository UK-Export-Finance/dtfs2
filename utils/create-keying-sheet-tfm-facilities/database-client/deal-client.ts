import { Collection, WithoutId } from 'mongodb';
import { AnyObject } from '@ukef/dtfs2-common';
import { mongoDbClient } from './mongo-db-client';

// This should be replaced by a more complete Deal type should one get created
type Deal = AnyObject & { ukefDealId: string };

export class DealClient {
  private static collection?: Collection<WithoutId<Deal>>;

  public static async init(): Promise<void> {
    this.collection = await mongoDbClient.getCollection('deals');
  }

  public static async insertIfNotExists(deal: Deal): Promise<void> {
    if (!this.collection) {
      throw new Error('Deal client has not yet been initialised');
    }

    const { ukefDealId } = deal;

    const numberOfDeals = await this.collection.count({ ukefDealId: { $eq: ukefDealId } });
    if (numberOfDeals !== 0) {
      console.info(`Facility with UKEF facility id '${ukefDealId}' already exists`);
      return;
    }

    console.info(`Inserting deal with ukef deal id '${ukefDealId}'`);
    await this.collection.insertOne(deal);
  }
}
