/* eslint-disable no-param-reassign */
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
 * Ascertain UKEF deal ID property path
 * as per deal type.
 * @param {String} dealType Deal Type
 * @returns {String} UKEF Deal ID property path
 */
const ukefDealIdPath = (dealType) => {
  switch (dealType) {
    case 'GEF':
      return 'dealSnapshot.ukefDealId';
    default:
      return 'dealSnapshot.details.ukefDealId';
  }
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
      { _id: ObjectId(id) },
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
 * @param {Object} updates Properties to update
 * @returns {Promise} Resolved as `true` when updated successfully, otherwise Reject error.
 */
const tfmDealUpdate = async (updatedDeal) => {
  try {
    const path = ukefDealIdPath(updatedDeal.dealSnapshot.dealType);
    const ukefDealId = updatedDeal.dealSnapshot.ukefDealId || updatedDeal.dealSnapshot.details.ukefDealId;

    delete updatedDeal._id;

    if (!connection) await connect();

    const response = await connection.collection(CONSTANTS.DATABASE.TABLES.TFM_DEAL).updateOne(
      { [path]: ukefDealId },
      {
        $set: {
          ...updatedDeal,
        },
      },
    ).catch((e) => new Error(e));

    return (response.acknowledged)
      ? Promise.resolve(true)
      : Promise.reject(response);
  } catch (e) {
    console.error(`TFM deal ${updatedDeal._id} update error: `, { e });
    return Promise.reject(new Error(e));
  }
};

/**
 * Update TFM Facility
 * @param {Object} updatedFacility Updated facility payload
 * @returns {Promise} Resolve if successful otherwise reject.
 */
const tfmFacilityUpdate = async (updatedFacility) => {
  try {
    delete updatedFacility._id;

    if (!connection) await connect();

    const response = await connection.collection(CONSTANTS.DATABASE.TABLES.TFM_FACILITIES).updateOne(
      { 'facilitySnapshot.ukefFacilityId': updatedFacility.facilitySnapshot.ukefFacilityId },
      {
        $set: {
          ...updatedFacility,
        },
      },
    ).catch((e) => new Error(e));

    return (response.acknowledged)
      ? Promise.resolve(true)
      : Promise.reject(response);
  } catch (e) {
    console.error(`TFM facility ${updatedFacility._id} update error: `, { e });
    return Promise.reject(new Error(e));
  }
};

module.exports = {
  getCollection,
  disconnect,
  portalDealUpdate,
  tfmDealUpdate,
  tfmFacilityUpdate,

};
