const assert = require('assert');

const db = require('../db-driver/client');

const findMandatoryCriteria = async (callback) => {
  const collection = await db.getCollection('mandatoryCriteria');

  collection.find({}).toArray((err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

const findOneMandatoryCriteria = async (id, callback) => {
  const collection = await db.getCollection('mandatoryCriteria');

  collection.findOne({ id }, (err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

exports.create = async (req, res) => {
  const collection = await db.getCollection('mandatoryCriteria');
  const mandatoryCriteria = await collection.insertOne(req.body);

  res.status(200).send(mandatoryCriteria);
};

exports.findAll = (req, res) => (
  findDeals((mandatoryCriteria) => res.status(200).send(mandatoryCriteria))
);

exports.findOne = (req, res) => (
  findOneDeal(req.params.id, (mandatoryCriteria) => res.status(200).send(mandatoryCriteria))
);

exports.update = (req, res) => {};

exports.delete = (req, res) => {};
