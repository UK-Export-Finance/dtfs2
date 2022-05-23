/**
 * Database connection helper functions
 */

require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');

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
    rows = filter
      ? await connection.collection(name).find(filter).toArray()
      : await connection.collection(name).find({}).toArray();
  }

  return new Promise((resolve, reject) => {
    if (rows) {
      resolve(rows);
    } else {
      reject();
    }
  });
};

module.exports = {
  getCollection,
  disconnect,
};
