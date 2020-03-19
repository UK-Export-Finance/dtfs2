const assert = require('assert');

const db = require('../db-driver/client');

const findBondCurrencies = async (callback) => {
  const collection = await db.getCollection('bondCurrencies');

  collection.find({}).toArray((err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

const findOneBondCurrency = async (id, callback) => {
  const collection = await db.getCollection('bondCurrencies');

  collection.findOne({ id }, (err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

exports.create = async (req, res) => {
  const collection = await db.getCollection('bondCurrencies');
  const deal = await collection.insertOne(req.body);

  res.status(200).send(deal);
};

exports.findAll = (req, res) => (
  findBondCurrencies((bondCurrencies) => res.status(200).send({
    count: bondCurrencies.length,
    bondCurrencies,
  }))
);

exports.findOne = (req, res) => (
  findOneBondCurrency(req.params.id, (bondCurrency) => res.status(200).send(bondCurrency))
);

exports.update = async (req, res) => {
  const collection = await db.getCollection('bondCurrencies');
  const status = await collection.updateOne({ id: { $eq: req.params.id } }, { $set: req.body }, {});
  res.status(200).send(status);
};

exports.delete = async (req, res) => {
  const collection = await db.getCollection('bondCurrencies');
  const status = await collection.deleteOne({ id: req.params.id });
  res.status(200).send(status);
};
