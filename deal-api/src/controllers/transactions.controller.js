const assert = require('assert');

const db = require('../db-driver/client');

const findTransactions = async (callback) => {
  const collection = await db.getCollection('transactions');

  collection.find({}).toArray((err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

const findOneTransaction = async (bankFacilityId, callback) => {
  const collection = await db.getCollection('transactions');

  collection.findOne({ bankFacilityId }, (err, result) => {
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
  findTransactions((transactions) => res.status(200).send({
    count: transactions.length,
    transactions,
  }))
);

exports.findOne = (req, res) => (
  findOneTransaction(req.params.bankFacilityId, (transaction) => res.status(200).send(transaction))
);

exports.update = async (req, res) => {
  const collection = await db.getCollection('transactions');
  const status = await collection.updateOne({ bankFacilityId: {$eq: req.params.bankFacilityId} }, {$set: req.body}, {});
  res.status(200).send(status);
};

exports.delete = async (req, res) => {
  const collection = await db.getCollection('transactions');
  const status = await collection.deleteOne({ bankFacilityId: req.params.bankFacilityId });
  res.status(200).send(status);
};
