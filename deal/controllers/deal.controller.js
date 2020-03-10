const assert = require('assert');

const { MongoClient } = require('mongodb');
const MOCKS = require('../mocks');

// Connection URL
const dbName = '<todo>';
const user = encodeURIComponent('<todo>');
const password = encodeURIComponent('<todo>');
const authMechanism = 'DEFAULT';
const url = `mongodb://${user}:${password}@localhost:27017/?authMechanism=${authMechanism}`;

const findDeals = (db, callback) => {
  const collection = db.collection('deals');

  collection.find({}).toArray((err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

const findOneDeal = (id, db, callback) => {
  const collection = db.collection('deals');

  collection.findOne({ id }, (err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

exports.create = (req, res) => {};

exports.findAll = (req, res) => {
  const client = new MongoClient(url, { useNewUrlParser: true });

  client.connect((err) => {
    const db = client.db(dbName);

    findDeals(db, (deals) => {
      client.close();
      res.status(200).send(deals);
    });
  });
};

exports.findOne = (req, res) => {
  const client = new MongoClient(url, { useNewUrlParser: true });

  client.connect((err) => {
    const db = client.db(dbName);

    findOneDeal(req.params.id, db, (deal) => {
      client.close();
      res.status(200).send(deal);
    });
  });
};

exports.update = (req, res) => {};

exports.delete = (req, res) => {};
