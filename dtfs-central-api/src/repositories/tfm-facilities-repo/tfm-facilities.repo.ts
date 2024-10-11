import { ObjectId, UpdateFilter, WithoutId, FindOneAndUpdateOptions, Collection, Document, UpdateResult, Filter } from 'mongodb';
import { AuditDetails, TfmFacility, TfmFacilityAmendment, AmendmentStatus } from '@ukef/dtfs2-common';
import { deleteMany } from '@ukef/dtfs2-common/change-stream';
import { mongoDbClient } from '../../drivers/db-client';
import { aggregatePipelines, AllFacilitiesAndFacilityCountAggregatePipelineOptions } from './aggregate-pipelines';

export class TfmFacilitiesRepo {
  private static async getCollection(): Promise<Collection<WithoutId<TfmFacility>>> {
    return await mongoDbClient.getCollection('tfm-facilities');
  }

  /**
   * Finds the tfm facilities by deal id
   * @param dealId - The deal id
   * @returns The found tfm facilities
   */
  public static async findByDealId(dealId: string | ObjectId): Promise<TfmFacility[]> {
    const collection = await this.getCollection();
    return await collection.find({ 'facilitySnapshot.dealId': { $eq: new ObjectId(dealId) } }).toArray();
  }

  /**
   * Finds the tfm facility with the supplied id
   * @param id - The id of the facility
   * @returns The found tfm facility
   */
  public static async findOneById(id: string | ObjectId): Promise<TfmFacility | null> {
    const collection = await this.getCollection();
    return await collection.findOne({ _id: { $eq: new ObjectId(id) } });
  }

  /**
   * Updates the tfm facility with the supplied id
   * @param id - The id to search by
   * @param update - The update to apply
   * @param [options] - Update options
   * @returns The document (returned after the update by default)
   */
  public static async findOneByIdAndUpdate(
    id: string | ObjectId,
    update: UpdateFilter<WithoutId<TfmFacility>>,
    options: FindOneAndUpdateOptions = { returnDocument: 'after' },
  ): Promise<TfmFacility | null> {
    const collection = await this.getCollection();
    const { value } = await collection.findOneAndUpdate({ _id: { $eq: new ObjectId(id) } }, update, options);
    return value;
  }

  /**
   * Updates the tfm facility with the supplied id
   * and amendment id
   * @param id - The facility id
   * @param amendmentId - The amendment id
   * @param update - The update to apply
   * @returns The update result
   */
  public static async updateOneByIdAndAmendmentId(
    id: string | ObjectId,
    amendmentId: string | ObjectId,
    update: UpdateFilter<WithoutId<TfmFacility>>,
  ): Promise<UpdateResult> {
    const collection = await this.getCollection();
    return await collection.updateOne(
      {
        _id: { $eq: new ObjectId(id) },
        'amendments.amendmentId': { $eq: new ObjectId(amendmentId) },
      },
      update,
    );
  }

  /**
   * Updates the tfm facility with the supplied id
   * @param id - The facility id
   * @param update - The update to apply
   * @returns The update result
   */
  public static async updateOneById(id: string | ObjectId, update: UpdateFilter<WithoutId<TfmFacility>>): Promise<UpdateResult> {
    const collection = await this.getCollection();
    return await collection.updateOne(
      {
        _id: { $eq: new ObjectId(id) },
      },
      update,
    );
  }

  /**
   * Finds the TFM facilities with the supplied ids
   * @param ids - The facility ids
   * @returns The found TFM facilities
   */
  public static async findByIds(ids: (string | ObjectId)[]): Promise<TfmFacility[]> {
    const collection = await this.getCollection();
    return await collection.find({ _id: { $in: ids.map((id) => new ObjectId(id)) } }).toArray();
  }

  /**
   * Delete many TFM facilities by the supplied deal id
   * @param dealId - The deal id
   * @param auditDetails - The audit details
   * @returns The delete result
   */
  public static async deleteManyByDealId(dealId: string | ObjectId, auditDetails: AuditDetails): Promise<{ acknowledged: boolean }> {
    const filter: Filter<TfmFacility> = {
      'facilitySnapshot.dealId': { $eq: new ObjectId(dealId) },
    };
    return await deleteMany({
      filter,
      collectionName: 'tfm-facilities',
      db: mongoDbClient,
      auditDetails,
    });
  }

  /**
   * Find amendments by the amendment status
   * @param status - The amendment status
   * @returns The found amendments
   */
  public static async findAmendmentsByStatus(status: AmendmentStatus): Promise<Document[]> {
    const collection = await this.getCollection();
    return await collection
      .aggregate(aggregatePipelines.amendmentsByStatus(status))
      .map<Document>((doc) => doc.amendments as Document)
      .toArray();
  }

  /**
   * Finds amendments by the facility id
   * @param facilityId - The facility id
   * @returns The found amendments
   */
  public static async findAmendmentsByFacilityId(facilityId: string | ObjectId): Promise<Document[]> {
    const collection = await this.getCollection();
    return await collection
      .aggregate(aggregatePipelines.amendmentsByFacilityId(facilityId))
      .map<Document>((doc) => doc.amendments as Document)
      .toArray();
  }

  /**
   * Finds amendments by the facility id and status
   * @param facilityId - The facility id
   * @param status - The amendment status
   * @returns The found amendments
   */
  public static async findAmendmentsByFacilityIdAndStatus(facilityId: string | ObjectId, status: AmendmentStatus): Promise<TfmFacilityAmendment[]> {
    const collection = await this.getCollection();
    return await collection
      .aggregate(aggregatePipelines.amendmentsByFacilityIdAndStatus(facilityId, status))
      .map<TfmFacilityAmendment>((doc) => doc.amendments as TfmFacilityAmendment)
      .toArray();
  }

  /**
   * Finds amendments by the facility id and amendment id
   * @param facilityId - The facility id
   * @param amendmentId - The amendment id
   * @returns The found amendments
   */
  public static async findAmendmentsByFacilityIdAndAmendmentId(facilityId: string | ObjectId, amendmentId: string | ObjectId): Promise<Document[]> {
    const collection = await this.getCollection();
    return await collection
      .aggregate(aggregatePipelines.amendmentsByFacilityIdAndAmendmentId(facilityId, amendmentId))
      .map<Document>((doc) => doc.amendments as Document)
      .toArray();
  }

  /**
   * Finds the amendment with the supplied facility id and amendment id
   * @param facilityId - The facility id
   * @param amendmentId - The amendment id
   * @returns The found amendment
   */
  public static async findAmendmentByFacilityIdAndAmendmentId(facilityId: string | ObjectId, amendmentId: string | ObjectId): Promise<Document | null> {
    const collection = await this.getCollection();
    const results = await collection
      .aggregate(aggregatePipelines.amendmentsByFacilityIdAndAmendmentId(facilityId, amendmentId))
      .map<Document>((doc) => doc.amendments as Document)
      .limit(1)
      .toArray();
    return results.at(0) ?? null;
  }

  /**
   * Finds amendments by the deal id
   * @param dealId - The deal id
   * @returns The found amendments
   */
  public static async findAmendmentsByDealId(dealId: string | ObjectId): Promise<Document[]> {
    const collection = await this.getCollection();
    return await collection
      .aggregate(aggregatePipelines.amendmentsByDealId(dealId))
      .map<Document>((doc) => doc.amendments as Document)
      .toArray();
  }

  /**
   * Finds amendments by the deal id and status
   * @param dealId - The deal id
   * @param status - The amendment status
   * @returns The found amendments
   */
  public static async findAmendmentsByDealIdAndStatus(dealId: string | ObjectId, status: AmendmentStatus): Promise<Document[]> {
    const collection = await this.getCollection();
    return await collection
      .aggregate(aggregatePipelines.amendmentsByDealIdAndStatus(dealId, status))
      .map<Document>((doc) => doc.amendments as Document)
      .toArray();
  }

  /**
   * Finds the latest completed amendment by facility id
   * @param facilityId - The facility id
   * @returns The latest completed amendment
   */
  public static async findLatestCompletedAmendmentByFacilityId(facilityId: string | ObjectId): Promise<TfmFacilityAmendment | null> {
    const collection = await this.getCollection();
    const amendments = await collection
      .aggregate(aggregatePipelines.latestCompletedAmendmentByFacilityId(facilityId))
      .map<TfmFacilityAmendment>((doc) => doc.amendments as TfmFacilityAmendment)
      .toArray();
    return amendments.at(0) ?? null;
  }

  /**
   * Finds the latest completed amendment by deal id
   * @param dealId - The deal id
   * @returns The latest completed amendment
   */
  public static async findLatestCompletedAmendmentByDealId(dealId: string | ObjectId): Promise<TfmFacilityAmendment | null> {
    const collection = await this.getCollection();
    const amendments = await collection
      .aggregate(aggregatePipelines.latestCompletedAmendmentByDealId(dealId))
      .map<TfmFacilityAmendment>((doc) => doc.amendments as TfmFacilityAmendment)
      .toArray();
    return amendments.at(0) ?? null;
  }

  /**
   * Finds all facilities after applying the aggregate options
   * with the total count
   * @param aggregateOptions - The aggregate options
   * @returns The found facilities and count
   */
  public static async findAllFacilitiesAndFacilityCount(
    aggregateOptions: AllFacilitiesAndFacilityCountAggregatePipelineOptions,
  ): Promise<{ count: number; facilities: Document[] } | null> {
    const collection = await this.getCollection();
    const result = await collection.aggregate(aggregatePipelines.allFacilitiesAndFacilityCount(aggregateOptions)).toArray();
    return (result.at(0) as { count: number; facilities: Document[] }) ?? null;
  }

  /**
   * Finds a facility which matches the supplied ukef facility id
   * @param ukefFacilityId - The ukef facility id
   * @returns The found document (or null if not found)
   */
  public static async findOneByUkefFacilityId(ukefFacilityId: string): Promise<TfmFacility | null> {
    const collection = await this.getCollection();
    return await collection.findOne({
      'facilitySnapshot.ukefFacilityId': { $eq: ukefFacilityId },
    });
  }

  /**
   * Finds the TFM facilities with the supplied ukef facility ids
   * @param ukefFacilityIds - The ukef facility ids
   * @returns The found TFM facilities
   */
  public static async findByUkefFacilityIds(ukefFacilityIds: string[]): Promise<TfmFacility[]> {
    const collection = await this.getCollection();
    return await collection.find({ 'facilitySnapshot.ukefFacilityId': { $in: ukefFacilityIds } }).toArray();
  }

  /**
   * Checks whether or not a facility exists which has a matching UKEF facility ID
   * @param ukefFacilityId - The UKEF facility ID
   * @returns Whether a not a facility with that UKEF facility ID exists
   */
  public static async ukefFacilityIdExists(ukefFacilityId: string): Promise<boolean> {
    const collection = await this.getCollection();
    const numberOfFoundDocuments = await collection.count({ 'facilitySnapshot.ukefFacilityId': { $eq: ukefFacilityId } });
    return numberOfFoundDocuments > 0;
  }
}
