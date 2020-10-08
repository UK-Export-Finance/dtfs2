const express = require('express');
const { MongoClient } = require('mongodb');
const util = require('util');

const router = express.Router();
const GITHUB_SHA = process.env.GITHUB_SHA || 'undefined';
const { MONGO_URI, REDIS_URI, MONGO_INITDB_DATABASE } = process.env;
const MONGODB_URI='mongodb://root:no@deal-api-data:27017/?authMechanism=DEFAULT';
const STORAGE_ACCOUNT = process.env.AZURE_PORTAL_STORAGE_ACCOUNT;
// const STORAGE_ACCESS_KEY = process.env.AZURE_PORTAL_STORAGE_ACCESS_KEY;

async function pingMongo() {
  if (!MONGO_URI) {
    return 'MONGO_URI is empty.';
  }

  let client
  try {
    client = await MongoClient.connect( MONGODB_URI );
    console.log('Querying mongo')
    return await client.db(MONGO_INITDB_DATABASE).listCollections().toArray();
  } catch (error) {
    console.log('Errrrrr')
    return util.inspect(error);
  } finally {
    if (client) {
      console.log('Closing client')
      client.close();
    }
  }
}

async function pingRedis() {
  return REDIS_URI;
}

async function pingStorage() {
  // console.log(STORAGE_ACCESS_KEY);
  return STORAGE_ACCOUNT;
}

router.get('/healthcheck', (req, res) => {
  const mongo = pingMongo();
  const redis = pingRedis();
  const storage = pingStorage();
  Promise.all([mongo, redis, storage]).then((values) => {
    res.status(200).json({
      commit_hash: GITHUB_SHA,
      mongo: values[0],
      redis: values[1],
      storage: values[2],
    });
  });
});

module.exports = router;
