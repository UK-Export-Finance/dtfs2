import z from 'zod';
import { ObjectId, UpdateFilter, WithoutId, WithId, FindOneAndUpdateOptions, Collection } from 'mongodb';
import { TfmFacilitySchema } from './tfm-facility.schema';
import { mongoDbClient } from '../../drivers/db-client';

export type RawTfmFacility = WithId<object>;

export type ParsedTfmFacility = z.infer<typeof TfmFacilitySchema>;

export class TfmFacilitiesRepo {
  /**
   * Gets the TFM facilities collection
   * @returns The TFM facilities collection
   */
  public static async getCollection(): Promise<Collection<WithoutId<RawTfmFacility>>> {
    return await mongoDbClient.getCollection('tfm-facilities');
  }

  /**
   * Validates and parses the result of a mongo `findOne` operation
   * @param result - The result of any `findOne` operation
   * @returns The parsed result
   * @throws If the result does not match the TFM facilities schema
   */
  public static validateAndParseFindOneResult(result: RawTfmFacility): ParsedTfmFacility {
    return TfmFacilitySchema.parse(result);
  }

  /**
   * Validates and parses the result of a mongo `find` operation
   * @param result - The result of any `find` operation
   * @returns The parsed results
   * @throws If the each item in the results array does not match the TFM facilities schema
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
   * @returns The updated document
   */
  public static async findOneByIdAndUpdate(id: string | ObjectId, update: UpdateFilter<WithoutId<RawTfmFacility>>, options: FindOneAndUpdateOptions = {}) {
    const collection = await this.getCollection();
    return await collection.findOneAndUpdate({ _id: { $eq: new ObjectId(id) } }, update, options);
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
}
