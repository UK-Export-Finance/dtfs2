import { InsertOneResult, ObjectId, UpdateFilter, UpdateResult, WithId, WithoutId } from 'mongodb';
import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { getCollection } from '../../database';

/**
 * Finds a document in the CRON_JOB_LOGS collection based on the provided deal ID.
 *
 * @param {ObjectId} dealId - The unique identifier for the deal.
 *
 * @returns {Promise<WithId<ObjectId> | WithoutId<unknown> | null>} - A promise that resolves to the found document, or `null` if no document is found.
 *
 * @throws {Error} - Throws an error if the find operation fails.
 *
 * @example
 * const dealId = new ObjectId('507f1f77bcf86cd799439011');
 *
 * find(dealId)
 *   .then((document) => console.log('Document found', document))
 *   .catch((error) => console.error('Find operation failed', error));
 */
export const find = async (dealId: ObjectId): Promise<WithId<ObjectId> | WithoutId<unknown> | null> => {
  try {
    const collection = await getCollection(MONGO_DB_COLLECTIONS.CRON_JOB_LOGS);

    return collection.findOne({ 'payload.dealId': { $eq: new ObjectId(dealId) } });
  } catch (error) {
    console.error('An error occurred while finding deal %s in %s collection.', dealId, MONGO_DB_COLLECTIONS.CRON_JOB_LOGS);
    return null;
  }
};

/**
 * Inserts a document into the CRON_JOB_LOGS collection.
 *
 * @param {object} document - The document to be inserted.
 *
 * @returns {Promise<InsertOneResult | boolean>} - A promise that resolves to the result of the insert operation, or `false` if an error occurs.
 *
 * @throws {Error} - Throws an error if the insert operation fails.
 *
 * @example
 * const document = { dealId: '507f1f77bcf86cd799439011', status: 'new' };
 *
 * insert(document)
 *   .then((result) => console.log('Insert successful', result))
 *   .catch((error) => console.error('Insert failed', error));
 */
export const insert = async (document: object): Promise<InsertOneResult | boolean> => {
  try {
    const collection = await getCollection(MONGO_DB_COLLECTIONS.CRON_JOB_LOGS);

    return collection.insertOne(document);
  } catch (error) {
    console.error('An error occurred while inserting into %s collection.', MONGO_DB_COLLECTIONS.CRON_JOB_LOGS);
    return false;
  }
};

/**
 * Updates a document in the CRON_JOB_LOGS collection based on the provided deal ID.
 *
 * @param {ObjectId} dealId - The unique identifier for the deal.
 * @param {UpdateFilter<WithoutId<object>>} document - The update filter containing the fields to be updated.
 *
 * @returns {Promise<UpdateResult | boolean>} - A promise that resolves to the result of the update operation, or `false` if an error occurs.
 *
 * @throws {Error} - Throws an error if the update operation fails.
 *
 * @example
 * const dealId = new ObjectId('507f1f77bcf86cd799439011');
 * const document = { status: 'updated' };
 *
 * update(dealId, document)
 *   .then((result) => console.log('Update successful', result))
 *   .catch((error) => console.error('Update failed', error));
 */
export const update = async (dealId: ObjectId, document: UpdateFilter<WithoutId<object>>): Promise<UpdateResult | boolean> => {
  try {
    const collection = await getCollection(MONGO_DB_COLLECTIONS.CRON_JOB_LOGS);

    return collection.updateOne({ 'payload.dealId': { $eq: new ObjectId(dealId) } }, { $set: { document } });
  } catch (error) {
    console.error('An error occurred while updating %s collection.', MONGO_DB_COLLECTIONS.CRON_JOB_LOGS);
    return false;
  }
};
