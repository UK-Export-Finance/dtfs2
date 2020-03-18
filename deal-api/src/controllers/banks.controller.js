const assert = require('assert');

const db = require('../db-driver/client');

const findBanks = async (callback) => {
  const collection = await db.getCollection('banks');

  collection.find({}).toArray((err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

const findOneBank = async (id, callback) => {
  const collection = await db.getCollection('banks');

  collection.findOne({ id }, (err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

exports.create = async (req, res) => {
  const collection = await db.getCollection('banks');
  const deal = await collection.insertOne(req.body);

  res.status(200).send(deal);
};

exports.findAll = (req, res) => (
  findBanks((banks) => res.status(200).send(banks))
);

exports.findOne = (req, res) => (
  findOneBank(req.params.id, (deal) => res.status(200).send(deal))
);


exports.update = async (req, res) => {
  const collection = await db.getCollection('banks');
  const status = await collection.update({ id: req.params.id }, req.body);
  res.status(200).send(status);
};

exports.delete = async (req, res) => {
  const collection = await db.getCollection('banks');
  const status = await collection.deleteOne({ id: req.params.id });
  res.status(200).send(status);
};
