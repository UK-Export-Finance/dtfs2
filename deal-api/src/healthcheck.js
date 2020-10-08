const express = require('express');
const { MongoClient } = require('mongodb');
const { NotifyClient } = require('notifications-node-client')
const util = require('util');

const router = express.Router();
const GITHUB_SHA = process.env.GITHUB_SHA || 'undefined';
const { MONGODB_URI } = process.env;
const MONGO_INITDB_DATABASE = process.env.MONGO_INITDB_DATABASE || 'test';
const STORAGE_ACCOUNT = process.env.AZURE_PORTAL_STORAGE_ACCOUNT;
// const STORAGE_ACCESS_KEY = process.env.AZURE_PORTAL_STORAGE_ACCESS_KEY;

async function pingMongo() {
  if (!MONGODB_URI) {
    return 'MONGODB_URI is empty.';
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

async function pingStorage() {
  return STORAGE_ACCOUNT;
}

async function pingNotify() {
  const notifyClient = new NotifyClient(process.env.GOV_NOTIFY_API_KEY)
  return await notifyClient
    .getAllTemplates('email')
    .then((response) => { return response.statusCode })
    .catch((err) => { return util.inspect(error); })
}

router.get('/healthcheck', (req, res) => {
  const mongo = pingMongo();
  const notify = pingNotify();
  const storage = pingStorage();
  Promise.all([mongo, notify, storage]).then((values) => {
    res.status(200).json({
      commit_hash: GITHUB_SHA,
      mongo: values[0],
      notify: values[1],
      storage: values[2],
    });
  });
});

module.exports = router;
