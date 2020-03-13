const assert = require('assert');

const db = require('../db-driver/client');

const findTransactions = async (callback) => {
  const collection = await db.getCollection('transactions');

  collection.find({}).toArray((err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

const findOneTransaction = async (id, callback) => {
  const collection = await db.getCollection('transactions');

  collection.findOne({ id }, (err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

exports.create = async (req, res) => {
  const collection = await db.getCollection('transactions');
  const transaction = await collection.insertOne(req.body);

  res.status(200).send(transaction);
};

exports.findAll = (req, res) => (
  findTransactions((transaction) => res.status(200).send(transaction))
);

exports.findOne = (req, res) => (
  findOneTransaction(req.params.id, (transaction) => res.status(200).send(transaction))
);

exports.update = (req, res) => {};

exports.delete = (req, res) => {};
