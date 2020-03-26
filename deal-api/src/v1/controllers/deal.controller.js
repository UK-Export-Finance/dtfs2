const assert = require('assert');
const ObjectId = require('mongodb').ObjectId;

const db = require('../../db-driver/client');

const withoutId = (obj) => {
  cleanedObject = {... obj};
  delete cleanedObject._id;
  return cleanedObject;
};

const findDeals = async (callback) => {
  const collection = await db.getCollection('deals');

  collection.find({}).toArray((err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

const findOneDeal = async (id, callback) => {
  const collection = await db.getCollection('deals');

  collection.findOne({ _id: new ObjectId(id) }, (err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

exports.create = async (req, res) => {
  const collection = await db.getCollection('deals');
  const response = await collection.insertOne(req.body);

  const deal = response.ops[0];
  res.status(200).send(deal);
};

exports.findAll = (req, res) => (
  findDeals((deals) => res.status(200).send({
    count: deals.length,
    deals,
  }))
);

exports.findOne = (req, res) => (
  findOneDeal(req.params.id, (deal) => res.status(200).send(deal))
);

exports.update = async (req, res) => {
  const collection = await db.getCollection('deals');
  const status = await collection.updateOne({ _id: { $eq: new ObjectId(req.params.id) } }, { $set: withoutId(req.body) }, {});
  res.status(200).send(req.body);
};

exports.delete = async (req, res) => {
  const collection = await db.getCollection('deals');
  const status = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
  res.status(200).send(status);
};
