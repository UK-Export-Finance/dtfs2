const { MongoClient } = require('mongodb');

const { dbName, url, options } = require('../config/database.config');

let client;

let connection = null;


const dbConnect = async () => {
  console.log({ options });
  client = await MongoClient.connect(
    url,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ...options,
    },
  );
  connection = client.db(dbName);
  return connection;
};

const getConnection = async () => {
  if (!connection) {
    connection = await dbConnect();
  }

  return connection;
};

module.exports.get = getConnection;

module.exports.getCollection = async (collectionName) => {
  if (!connection) {
    await getConnection();
  }

  return connection.collection(collectionName);
};
