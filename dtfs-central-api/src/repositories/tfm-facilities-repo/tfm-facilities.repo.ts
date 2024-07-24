import z from 'zod';
import { ObjectId, UpdateFilter, WithoutId, WithId, FindOneAndUpdateOptions, Collection, Document, UpdateResult, Filter } from 'mongodb';
import { AuditDetails } from '@ukef/dtfs2-common';
import { deleteMany } from '@ukef/dtfs2-common/change-stream';
import { TfmFacilitySchema } from './tfm-facility.schema';
import { mongoDbClient } from '../../drivers/db-client';
import { aggregatePipelines, AllFacilitiesAndFacilityCountAggregatePipelineOptions } from './aggregate-pipelines';

export type RawTfmFacility = WithId<object>;

export type ParsedTfmFacility = z.infer<typeof TfmFacilitySchema>;

export class TfmFacilitiesRepo {
  private static async getCollection(): Promise<Collection<WithoutId<RawTfmFacility>>> {
    return await mongoDbClient.getCollection('tfm-facilities');
  }

  /**
   * Validates and parses the result of a mongo `findOne` operation
   * @param result - The result of any `findOne` operation
   * @returns The parsed result
   * @throws {z.ZodError} If the result does not match the TFM facilities schema
   */
  public static validateAndParseFindOneResult(result: RawTfmFacility): ParsedTfmFacility {
    return TfmFacilitySchema.parse(result);
  }

  /**
   * Validates and parses the result of a mongo `find` operation
   * @param result - The result of any `find` operation
   * @returns The parsed results
   * @throws {z.ZodError} If any item in the results array does not match the TFM facilities schema
   */
  public static validateAndParseFindResult(results: RawTfmFacility[]): ParsedTfmFacility[] {
    return results.map((result) => this.validateAndParseFindOneResult(result));
  }

  /**
   * Finds the tfm facilities by deal id
   * @param dealId - The deal id
   * @returns The found tfm facilities
   */
  public static async findByDealId(dealId: string | ObjectId): Promise<RawTfmFacility[]> {
    const collection = await this.getCollection();
    return await collection.find({ 'facilitySnapshot.dealId': { $eq: new ObjectId(dealId) } }).toArray();
  }

  /**
   * Finds the tfm facility with the supplied id
   * @param id - The id of the facility
   * @returns The found tfm facility
   */
  public static async findOneById(id: string | ObjectId): Promise<RawTfmFacility | null> {
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
    update: UpdateFilter<WithoutId<RawTfmFacility>>,
    options: FindOneAndUpdateOptions = { returnDocument: 'after' },
  ): Promise<RawTfmFacility | null> {
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
    update: UpdateFilter<WithoutId<RawTfmFacility>>,
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
  public static async updateOneById(id: string | ObjectId, update: UpdateFilter<WithoutId<RawTfmFacility>>): Promise<UpdateResult> {
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
  public static async findByIds(ids: (string | ObjectId)[]): Promise<RawTfmFacility[]> {
    const collection = await this.getCollection();
    return await collection.find({ _id: { $in: ids } }).toArray();
  }

  /**
   * Delete many TFM facilities by the supplied deal id
   * @param dealId - The deal id
   * @param auditDetails - The audit details
   * @returns The delete result
   */
  public static async deleteManyByDealId(dealId: string | ObjectId, auditDetails: AuditDetails): Promise<{ acknowledged: boolean }> {
    const filter: Filter<RawTfmFacility> = {
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
  public static async findAmendmentsByStatus(status: string): Promise<Document[]> {
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
  public static async findAmendmentsByFacilityIdAndStatus(facilityId: string | ObjectId, status: string): Promise<Document[]> {
    const collection = await this.getCollection();
    return await collection
      .aggregate(aggregatePipelines.amendmentsByFacilityIdAndStatus(facilityId, status))
      .map<Document>((doc) => doc.amendments as Document)
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
  public static async findAmendmentsByDealIdAndStatus(dealId: string | ObjectId, status: string): Promise<Document[]> {
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
  public static async findLatestCompletedAmendmentByFacilityId(facilityId: string | ObjectId): Promise<Document | null> {
    const collection = await this.getCollection();
    const amendments = await collection
      .aggregate(aggregatePipelines.latestCompletedAmendmentByFacilityId(facilityId))
      .map<Document>((doc) => doc.amendments as Document)
      .toArray();
    return amendments.at(0) ?? null;
  }

  /**
   * Finds the latest completed amendment by deal id
   * @param dealId - The deal id
   * @returns The latest completed amendment
   */
  public static async findLatestCompletedAmendmentByDealId(dealId: string | ObjectId): Promise<Document | null> {
    const collection = await this.getCollection();
    const amendments = await collection
      .aggregate(aggregatePipelines.latestCompletedAmendmentByDealId(dealId))
      .map<Document>((doc) => doc.amendments as Document)
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
}
