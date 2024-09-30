import { Collection, WithoutId } from 'mongodb';
import { TfmFacility } from '@ukef/dtfs2-common';
import { mongoDbClient } from '../../drivers/db-client';

export class TfmFacilityClient {
  private static collection?: Collection<WithoutId<TfmFacility>>;

  public static async init(): Promise<void> {
    this.collection = await mongoDbClient.getCollection('tfm-facilities');
  }

  public static async insertIfNotExists(tfmFacility: WithoutId<TfmFacility>): Promise<void> {
    if (!this.collection) {
      throw new Error('TFM facility client has not yet been initialised');
    }

    const { ukefFacilityId } = tfmFacility.facilitySnapshot;

    const numberOfFacilities = await this.collection.count({ 'facilitySnapshot.ukefFacilityId': { $eq: ukefFacilityId } });
    if (numberOfFacilities !== 0) {
      console.info(`TFM facility with UKEF facility id '${ukefFacilityId}' already exists`);
      return;
    }

    console.info(`Inserting TFM facility with UKEF facility id '${ukefFacilityId}'`);
    await this.collection.insertOne(tfmFacility);
  }
}
