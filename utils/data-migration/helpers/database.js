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
 * @returns {Promise<object>} Connection
 */
const connect = async () => {
  client = await MongoClient.connect(url);
  connection = await client.db(database);
  return connection;
};

const disconnect = async () => {
  if (client) await client.close();
};

/**
 * Retrieves complete collection
 * @param {string} name Collection name
 * @param {object} filter Search filter, default to `null`
 * @returns {Promise<object>} Collection rows
 */
const getCollection = async (name, filter = null, raw = null) => {
  if (!connection) await connect();
  let rows;

  if (raw) {
    rows = await connection.collection(name);
  } else {
    rows = filter ? await connection.collection(name).find(filter).toArray() : await connection.collection(name).find().toArray();
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
 * @param {string} ukefDealId UKEF Deal ID
 * @param {object} updates Properties to update
 * @returns {Promise} Resolved as `true` when updated successfully, otherwise Reject error.
 */
const portalDealUpdate = async (id, updates) => {
  if (!ObjectId.isValid(id)) {
    throw new Error('Invalid Deal Id');
  }

  try {
    if (!connection) await connect();
    const response = await connection.collection(CONSTANTS.DATABASE.TABLES.DEAL).updateOne(
      { _id: { $eq: ObjectId(id) } },
      {
        $set: {
          ...updates,
        },
      },
    );

    return response.acknowledged ? Promise.resolve(true) : Promise.reject(response);
  } catch (error) {
    console.error(`Portal deal ${id} update error: `, { error });
    return Promise.reject(new Error(false));
  }
};

/**
 * Portal facilities - Updates portal facility collection
 * @param {string} facilityId facility ID
 * @param {object} updates Properties to update
 * @returns {Promise} Resolved as `true` when updated successfully, otherwise Reject error.
 */
const portalFacilityUpdate = async (id, updates) => {
  if (!ObjectId.isValid(id)) {
    throw new Error('Invalid Facility Id');
  }

  try {
    if (!connection) await connect();
    const response = await connection.collection(CONSTANTS.DATABASE.TABLES.FACILITIES).updateOne(
      { _id: { $eq: ObjectId(id) } },
      {
        $set: {
          ...updates,
        },
      },
    );

    return response.acknowledged ? Promise.resolve(true) : Promise.reject(response);
  } catch (error) {
    console.error(`Portal deal ${id} update error: `, { error });
    return Promise.reject(new Error(false));
  }
};

/**
 * TFM - Updates collection property(ies)
 * @param {object} updates Properties to update
 * @returns {Promise} Resolved as `true` when updated successfully, otherwise Reject error.
 */
const tfmDealUpdate = async (updatedDeal) => {
  try {
    const { _id } = updatedDeal;
    const idAsString = String(_id);

    if (!ObjectId.isValid(idAsString)) {
      throw new Error('Invalid Deal Id');
    }

    delete updatedDeal._id;

    if (!connection) await connect();

    const response = await connection
      .collection(CONSTANTS.DATABASE.TABLES.TFM_DEAL)
      .updateOne({ _id: { $eq: ObjectId(idAsString) } }, { $set: updatedDeal }, { returnNewDocument: true, returnDocument: 'after' })
      .catch((error) => new Error(error));

    return response.acknowledged ? Promise.resolve(true) : Promise.reject(response);
  } catch (error) {
    console.error(`TFM deal ${updatedDeal._id} update error: `, { error });
    return Promise.reject(new Error(error));
  }
};

/**
 * Update TFM Facility
 * @param {object} updatedFacility Updated facility payload
 * @returns {Promise} Resolve if successful otherwise reject.
 */
const tfmFacilityUpdate = async (updatedFacility) => {
  if (typeof updatedFacility?.facilitySnapshot?.ukefFacilityId !== 'string') {
    throw new Error('Invalid UKEF Facility Id');
  }

  try {
    delete updatedFacility._id;

    if (!connection) await connect();
    const response = await connection
      .collection(CONSTANTS.DATABASE.TABLES.TFM_FACILITIES)
      .updateOne(
        { 'facilitySnapshot.ukefFacilityId': { $eq: updatedFacility.facilitySnapshot.ukefFacilityId } },
        {
          $set: {
            ...updatedFacility,
          },
        },
      )
      .catch((error) => new Error(error));

    return response.acknowledged ? Promise.resolve(true) : Promise.reject(response);
  } catch (error) {
    console.error(`TFM facility ${updatedFacility._id} update error: `, { error });
    return Promise.reject(new Error(error));
  }
};

module.exports = {
  getCollection,
  disconnect,
  portalDealUpdate,
  portalFacilityUpdate,
  tfmDealUpdate,
  tfmFacilityUpdate,
};
