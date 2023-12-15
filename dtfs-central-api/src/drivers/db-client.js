const { MongoClient } = require('mongodb');

const { dbName, url } = require('../config/database.config');

/**
 * @typedef {import('mongodb').Db} DbConnection
 * @typedef {import('mongodb').MongoClient} MongoClient
 * @typedef {import('../types/db-models/db-collection-name').DbCollectionName} DbCollectionName
 */

/** @type {MongoClient | undefined} */
let client;

/** @type {DbConnection | null} */
let connection = null;

/**
 * @returns {Promise<{client: MongoClient, connection: DbConnection}>}
 */
const dbConnect = async () => {
  client = await MongoClient.connect(url);
  connection = client.db(dbName);
  return { client, connection };
};

/**
 * @returns {Promise<DbConnection>}
 */
const getConnection = async () => {
  if (!connection) {
    return (await dbConnect()).connection;
  }

  return connection;
};

module.exports.get = getConnection;

/**
 * @returns {Promise<MongoClient>}
 */
const getClient = async () => {
  if (!client) {
    return (await dbConnect()).client;
  }

  return client;
};

module.exports.getClient = getClient;

/**
 * @template TDoc
 * @param {DbCollectionName} collectionName
 * @return {Promise<import('mongodb').Collection<TDoc>>}
 */
module.exports.getCollection = async (collectionName) => {
  if (!connection) {
    await getConnection();
  }
  return connection.collection(collectionName);
};

module.exports.close = async () => {
  if (client) {
    await client.close();
  }
};
