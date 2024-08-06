import { Collection, WithoutId } from 'mongodb';
import { Facility } from '@ukef/dtfs2-common';
import { mongoDbClient } from './mongo-db-client';

export class FacilityClient {
  private static collection?: Collection<WithoutId<Facility>>;

  public static async init(): Promise<void> {
    this.collection = await mongoDbClient.getCollection('facilities');
  }

  public static async insertIfNotExists(facility: Facility): Promise<void> {
    if (!this.collection) {
      throw new Error('Facility client has not yet been initialised');
    }

    const { ukefFacilityId } = facility;

    const numberOfFacilities = await this.collection.count({ ukefFacilityId: { $eq: ukefFacilityId } });
    if (numberOfFacilities !== 0) {
      console.info(`Facility with UKEF facility id '${ukefFacilityId}' already exists`);
      return;
    }

    console.info(`Inserting facility with UKEF facility id '${ukefFacilityId}'`);
    await this.collection.insertOne(facility);
  }
}
