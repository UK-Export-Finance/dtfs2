const { MongoClient } = require('mongodb');

let client;

let connection = null;

const dbConnect = async ({ dbConnectionString, dbName }) => {
  client = await MongoClient.connect(dbConnectionString);
  connection = await client.db(dbName);
  return connection;
};

const getConnection = async (connectionOptions) => {
  if (!connection) {
    connection = await dbConnect(connectionOptions);
  }

  return connection;
};

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
