const { MongoClient } = require('mongodb');
import { dbName, url } from '../config';

let client: any;
let connection: any = null;

const dbConnect = async () => {
  client = await MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  connection = await client.db(dbName);
  return connection;
};

export const getConnection = async () => {
  if (!connection) {
    connection = await dbConnect();
  }

  return connection;
};

export const getCollection = async (collectionName: any) => {
  if (!connection) {
    await getConnection();
  }
  const collection = await connection.collection(collectionName);

  return collection;
};

export const close = async () => {
  if (client) {
    await client.close();
  }
};
