const assert = require('assert');

const db = require('../db-driver/client');

const findIndustrySectors = async (callback) => {
  const collection = await db.getCollection('industrySectors');

  collection.find({}).toArray((err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

const findOneIndustrySector = async (id, callback) => {
  const collection = await db.getCollection('industrySectors');

  collection.findOne({ id }, (err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

exports.create = async (req, res) => {
  const collection = await db.getCollection('industrySectors');
  const industrySector = await collection.insertOne(req.body);

  res.status(200).send(industrySector);
};

exports.findAll = (req, res) => (
  findIndustrySectors((industrySectors) => res.status(200).send(industrySectors))
);

exports.findOne = (req, res) => (
  findOneIndustrySector(req.params.id, (industrySector) => res.status(200).send(industrySector))
);

exports.update = (req, res) => {};

exports.delete = (req, res) => {};
