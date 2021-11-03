const express = require('express');
const { MongoClient } = require('mongodb');
const util = require('util');
const shareTest = require('./fileshare-test');

const router = express.Router();
const GITHUB_SHA = process.env.GITHUB_SHA || 'undefined';
const { MONGODB_URI } = process.env;
const MONGO_INITDB_DATABASE = process.env.MONGO_INITDB_DATABASE || 'test';

async function pingStorage(doFetch) {
  if (!doFetch) {
    return false;
  }

  const fileshare = await shareTest();
  return {
    fileshare,
  };
}

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
  const storage = pingStorage(Boolean(req.query.fetchtest));

  Promise.all([mongo, storage]).then((values) => {
    res.status(200).json({
      commit_hash: GITHUB_SHA,
      mongo: values[0],
      storage: values[1],
    });
  });
});

module.exports = router;
