import { Document, InsertOneResult, UpdateResult, WithId, ObjectId } from 'mongodb';
import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { getCollection } from '../../database';

/**
 * The EstoreRepo class provides methods to interact with the CRON_JOB_LOGS collection in the MongoDB database.
 * It includes methods:
 * 1. Find log by Mongo deal id
 * 2. Insert one document
 * 3. Update document by Mongo deal id
 */
export class EstoreRepo {
  /**
   * Finds a document in the CRON_JOB_LOGS collection based on the provided deal ID.
   *
   * @param {string} dealId - The unique identifier for the deal.
   *
   * @returns {Promise<WithId<object> | null>} - A promise that resolves to the found document, or `null` if no document is found.
   *
   * @example
   * const dealId = '507f1f77bcf86cd799439011';
   *
   * EstoreRepo.findByDealId(dealId)
   *   .then((document) => console.log('Document found', document))
   *   .catch((error) => console.error('Find operation failed', error));
   */
  public static async findByDealId(dealId: string): Promise<WithId<object> | null> {
    try {
      const collection = await getCollection(MONGO_DB_COLLECTIONS.CRON_JOB_LOGS);

      return collection.findOne({ 'payload.dealId': { $eq: dealId } });
    } catch (error) {
      console.error('An error occurred while finding deal %s in %s collection.', dealId, MONGO_DB_COLLECTIONS.CRON_JOB_LOGS);
      return null;
    }
  }

  /**
   * Inserts a document into the CRON_JOB_LOGS collection.
   *
   * @param {object} document - The document to be inserted.
   *
   * @returns {Promise<InsertOneResult | boolean>} - A promise that resolves to the result of the insert operation, or `false` if an error occurs.
   *
   * @example
   * const document = { dealId: '507f1f77bcf86cd799439011', status: 'new' };
   *
   * insertOne(document)
   *   .then((result) => console.log('Insert successful', result))
   *   .catch((error) => console.error('Insert failed', error));
   */
  public static async insertOne(document: Document): Promise<InsertOneResult | boolean> {
    try {
      const collection = await getCollection(MONGO_DB_COLLECTIONS.CRON_JOB_LOGS);

      return collection.insertOne(document);
    } catch (error) {
      console.error('An error occurred while inserting into %s collection.', MONGO_DB_COLLECTIONS.CRON_JOB_LOGS);
      return false;
    }
  }

  /**
   * Updates a document in the CRON_JOB_LOGS collection based on the provided deal ID.
   *
   * @param {string} dealId - The unique identifier for the deal.
   * @param {Document} document - The update filter containing the fields to be updated.
   *
   * @returns {Promise<UpdateResult | boolean>} - A promise that resolves to the result of the update operation, or `false` if an error occurs.
   *
   * @example
   * const dealId = '507f1f77bcf86cd799439011';
   * const document = { status: 'updated' };
   *
   * EstoreRepo.updateByDealId(dealId, document)
   *   .then((result) => console.log('Update successful', result))
   *   .catch((error) => console.error('Update failed', error));
   */
  public static async updateByDealId(dealId: string, document: Document): Promise<UpdateResult | boolean> {
    try {
      const collection = await getCollection(MONGO_DB_COLLECTIONS.CRON_JOB_LOGS);

      return collection.updateOne({ 'payload.dealId': { $eq: dealId } }, { $set: document });
    } catch (error) {
      console.error('An error occurred while updating %s collection.', MONGO_DB_COLLECTIONS.CRON_JOB_LOGS);
      return false;
    }
  }

  /**
   * Updates a document in the TFM_DEALS collection based on the provided deal ID.
   *
   * @param {string} dealId - The unique identifier for the deal.
   * @param {Document} document - The update filter containing the fields to be updated.
   *
   * @returns {Promise<UpdateResult | boolean>} - A promise that resolves to the result of the update operation, or `false` if an error occurs.
   *
   * @example
   * const dealId = '507f1f77bcf86cd799439011';
   * const document = { status: 'updated' };
   *
   * EstoreRepo.updateTfmDealByDealId(dealId, document)
   *   .then((result) => console.log('Update successful', result))
   *   .catch((error) => console.error('Update failed', error));
   */
  public static async updateTfmDealByDealId(dealId: string, document: Document): Promise<UpdateResult | boolean> {
    try {
      const collection = await getCollection(MONGO_DB_COLLECTIONS.TFM_DEALS);

      return collection.updateOne({ _id: { $eq: new ObjectId(dealId) } }, { $set: document });
    } catch (error) {
      console.error('An error occurred while updating %s collection.', MONGO_DB_COLLECTIONS.TFM_DEALS);
      return false;
    }
  }
}
