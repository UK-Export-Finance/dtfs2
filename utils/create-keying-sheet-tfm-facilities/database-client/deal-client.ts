import { Collection, WithoutId } from 'mongodb';
import { Deal } from '@ukef/dtfs2-common';
import { mongoDbClient } from '../../drivers/db-client';

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
      console.info("Deal with UKEF deal id '%s' already exists", ukefDealId);
      return;
    }

    console.info("Inserting deal with ukef deal id '%s'", ukefDealId);
    await this.collection.insertOne(deal);
  }
}
