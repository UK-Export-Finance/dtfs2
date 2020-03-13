const assert = require('assert');

const db = require('../db-driver/client');

const findDeals = async (callback) => {
  const collection = await db.getCollection('deals');

  collection.find({}).toArray((err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

const findOneDeal = async (id, callback) => {
  const collection = await db.getCollection('deals');

  collection.findOne({ id }, (err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

exports.create = async (req, res) => {
  const collection = await db.getCollection('deals');
  const deal = await collection.insertOne(req.body);

  res.status(200).send(deal);
};

exports.findAll = (req, res) => (
  findDeals((deals) => res.status(200).send(deals))
);

exports.findOne = (req, res) => (
  findOneDeal(req.params.id, (deal) => res.status(200).send(deal))
);

exports.update = (req, res) => {};

exports.delete = (req, res) => {};
