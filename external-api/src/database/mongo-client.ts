import { MongoDbClient } from '@ukef/dtfs2-common/mongo-db-client';
import { MongoDbCollectionName } from '@ukef/dtfs2-common';

/**
 * An instance of the MongoDbClient class.
 *
 * This client is used to interact with the MongoDB database.
 */
export const mongoDbClient = new MongoDbClient();

// TODO: Move to libs/common
/**
 * Gets a MongoDB collection by name.
 *
 * @template CollectionName - The type of the collection name.
 * @param {CollectionName} collectionName - The name of the collection to retrieve.
 * @returns {Promise<Collection<CollectionName>>} A promise that resolves to the MongoDB collection.
 */
export const getCollection = async <CollectionName extends MongoDbCollectionName>(collectionName: CollectionName) =>
  mongoDbClient.getCollection<CollectionName>(collectionName);
