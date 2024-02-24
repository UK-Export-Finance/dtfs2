const { MongoClient } = require('mongodb');

/**
 * @typedef ConnectionOptions
 * @property {string} dbConnectionString
 * @property {string} dbName
 */

/**
 * @type {import('mongodb').MongoClient | undefined}
 */
let client;

/**
 * @type {import('mongodb').Db | null}
 */
let connection = null;

/**
 * @param {ConnectionOptions}
 * @returns {import('mongodb').Db}
 */
const dbConnect = async ({ dbConnectionString, dbName }) => {
  client = await MongoClient.connect(dbConnectionString);
  connection = await client.db(dbName);
  return connection;
};

/**
 * @param {ConnectionOptions} connectionOptions - The connection options
 * @returns {import('mongodb').Db}
 */
const getConnection = async (connectionOptions) => {
  if (!connection) {
    connection = await dbConnect(connectionOptions);
  }

  return connection;
};

/**
 * @param {string} collectionName - The collection name
 * @param {ConnectionOptions} connectionOptions - The connection options
 * @returns {import('mongodb').Collection<import('bson').Document>}
 */
module.exports.getCollection = async (collectionName, connectionOptions) => {
  if (!connection) {
    await getConnection(connectionOptions);
  }
  const collection = await connection.collection(collectionName);

  return collection;
};

module.exports.close = async () => {
  if (client) {
    await client.close();
  }
};
