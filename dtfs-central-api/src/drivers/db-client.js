const { MongoClient } = require('mongodb');

const { dbName, url } = require('../config/database.config');

let client;

let connection = null;

const dbConnect = async () => {
  client = await MongoClient.connect(url);
  connection = await client.db(dbName);
  return connection;
};

const getConnection = async () => {
  if (!connection) {
    connection = await dbConnect();
  }

  return connection;
};

module.exports.get = getConnection;

const getClient = async () => {
  if (!connection) {
    await dbConnect();
  }

  return client;
};

module.exports.getClient = getClient;

module.exports.getCollection = async (collectionName) => {
  if (!connection) {
    await getConnection();
  }
  const collection = await connection.collection(collectionName);

  return collection;
};

module.exports.close = async () => {
  if (client) {
    await client.close();
  }
};
