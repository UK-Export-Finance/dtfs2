import z from 'zod';
import {
  ObjectId,
  UpdateFilter,
  WithoutId,
  WithId,
  FindOneAndUpdateOptions,
  Collection,
  Document,
  AggregationCursor,
  AggregateOptions,
  UpdateResult,
  Filter,
} from 'mongodb';
import { AuditDetails } from '@ukef/dtfs2-common';
import { deleteMany } from '@ukef/dtfs2-common/change-stream';
import { TfmFacilitySchema } from './tfm-facility.schema';
import { mongoDbClient } from '../../drivers/db-client';

export type RawTfmFacility = WithId<object>;

export type ParsedTfmFacility = z.infer<typeof TfmFacilitySchema>;

type ExecuteAggregateResult = {
  aggregationCursor: AggregationCursor<Document>;
  resultsArray: Document[];
};

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
   * Method to execute an aggregate against the TFM facilities collection
   * @param pipeline - The aggregate pipeline
   * @param [options] - The aggregate options
   * @returns The aggregation cursor and array of aggregate results
   */
  public static async executeAggregate(pipeline: Document[], options?: AggregateOptions): Promise<ExecuteAggregateResult> {
    const collection = await this.getCollection();
    const aggregationCursor = collection.aggregate(pipeline, options);
    const resultsArray = await aggregationCursor.toArray();
    return { aggregationCursor, resultsArray };
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
}
