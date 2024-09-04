import util from 'util';
import express from 'express';
import { MongoClient } from 'mongodb';

const router = express.Router();
const GITHUB_SHA = process.env.GITHUB_SHA || 'undefined';
const { MONGODB_URI } = process.env;
const MONGO_INITDB_DATABASE = process.env.MONGO_INITDB_DATABASE || 'test';

async function pingMongo() {
  if (!MONGODB_URI) {
    return `MONGODB_URI is empty. ${JSON.stringify(process.env)}`;
  }

  let client;
  try {
    client = await MongoClient.connect(MONGODB_URI);
    return await client.db(MONGO_INITDB_DATABASE).listCollections().toArray();
  } catch (error) {
    return util.inspect(error);
  } finally {
    if (client) {
      client.close();
    }
  }
}

router.get('/healthcheck', (req, res) => {
  const mongo = pingMongo();
  Promise.all([mongo]).then((values) => {
    res.status(200).json({
      commit_hash: GITHUB_SHA,
      mongo: values[0],
    });
  });
});

export default router;
