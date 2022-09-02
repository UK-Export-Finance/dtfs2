/**
 * Database connection helper functions
 */

require('dotenv').config({ path: '../../../.env' });
const { ObjectId } = require('mongodb');
const { MongoClient } = require('mongodb');
const CONSTANTS = require('../constant');

let client;
let connection;
const database = process.env.MONGO_INITDB_DATABASE;
const url = process.env.MONGODB_URI;

/**
 * Initiates MongoDB connection
 * @returns {Object} Connection
 */
const connect = async () => {
  client = await MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  connection = await client.db(database);
  return connection;
};

const disconnect = async () => {
  if (client) await client.close();
};

/**
 * Retrieves complete collection
 * @param {String} name Collection name
 * @param {Object} filter Search filter, default to `null`
 * @returns {Object} Collection rows
 */
const getCollection = async (name, filter = null, raw = null) => {
  if (!connection) await connect();
  let rows;

  if (raw) {
    rows = await connection.collection(name);
  } else {
    rows = filter ? await connection.collection(name).find(filter).toArray() : await connection.collection(name).find({}).toArray();
  }

  return new Promise((resolve, reject) => {
    if (rows) {
      resolve(rows);
    } else {
      reject(new Error(`Unable to get collection ${name}`));
    }
  });
};

/**
 * Portal - Updates collection property(ies)
 * @param {String} ukefDealId UKEF Deal ID
 * @param {Object} updates Properties to update
 * @returns {Promise} Resolved as `true` when updated successfully, otherwise Reject error.
 */
const portalDealUpdate = async (id, updates) => {
  try {
    if (!connection) await connect();
    const response = await connection.collection(CONSTANTS.DATABASE.TABLES.DEAL).updateOne(
      { 'details.id': ObjectId(id) },
      {
        $set: {
          ...updates,
        },
      },
    );

    return (response.acknowledged)
      ? Promise.resolve(true)
      : Promise.reject(response);
  } catch (e) {
    console.error(`Portal deal ${id} update error: `, { e });
    return Promise.reject(new Error(false));
  }
};

/**
 * TFM - Updates collection property(ies)
 * @param {String} ukefDealId UKEF Deal ID
 * @param {Object} updates Properties to update
 * @returns {Promise} Resolved as `true` when updated successfully, otherwise Reject error.
 */
const tfmDealUpdate = async (ukefDealId, updates) => {
  if (!connection) await connect();
  const response = await connection.collection(CONSTANTS.DATABASE.TABLES.TFM_DEAL).updateOne(
    { 'dealSnapshot.ukefDealId': ukefDealId },
    {
      $set: {
        ...updates,
      },
    },
  );

  return new Promise((resolve, reject) => {
    if (Object.prototype.hasOwnProperty.call(response, 'acknowledged')) {
      resolve(true);
    } else {
      reject(new Error(`Unable to update TFM deal property ${ukefDealId}`));
    }
  });
};

module.exports = {
  getCollection,
  disconnect,
  portalDealUpdate,
  tfmDealUpdate,
};
