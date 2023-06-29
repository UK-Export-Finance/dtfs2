const { MongoClient } = require('mongodb');
require('dotenv').config();

let client;

let connection = null;

const dbConnect = async () => {
  const connectionString = process.env.MONGODB_URI;

  client = await MongoClient.connect(
    connectionString,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  );
  const dbName = process.env.MONGO_INITDB_DATABASE;
  connection = await client.db(dbName);
  return connection;
};

const getConnection = async () => {
  if (!connection) {
    connection = await dbConnect();
  }

  return connection;
};

module.exports.getCollection = async (collectionName) => {
  if (!connection) {
    await getConnection();
  }
  const collection = await connection.collection(collectionName);

  return collection;
};

module.exports.closeDbConnection = async () => {
  if (client) {
    await client.close();
  }
};
