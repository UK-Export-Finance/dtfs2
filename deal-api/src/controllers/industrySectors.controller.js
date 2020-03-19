const assert = require('assert');

const db = require('../db-driver/client');

const findIndustrySectors = async (callback) => {
  const collection = await db.getCollection('industrySectors');

  collection.find({}).toArray((err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

const findOneIndustrySector = async (code, callback) => {
  const collection = await db.getCollection('industrySectors');

  collection.findOne({ code }, (err, result) => {
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
  findIndustrySectors((industrySectors) => res.status(200).send({
    count: industrySectors.length,
    industrySectors,
  }))
);

exports.findOne = (req, res) => (
  findOneIndustrySector(req.params.code, (industrySector) => res.status(200).send(industrySector))
);

exports.update = async (req, res) => {
  const collection = await db.getCollection('industrySectors');
  const status = await collection.updateOne({ code: { $eq: req.params.code } }, { $set: req.body }, {});
  res.status(200).send(status);
};

exports.delete = async (req, res) => {
  const collection = await db.getCollection('industrySectors');
  const status = await collection.deleteOne({ code: req.params.code });
  res.status(200).send(status);
};
