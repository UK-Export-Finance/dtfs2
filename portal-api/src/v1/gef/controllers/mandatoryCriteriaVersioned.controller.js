const assert = require('assert');
const { ObjectID } = require('mongodb');

const db = require('../../../drivers/db-client');
const { MandatoryCriteria } = require('../models/mandatoryCriteria');
const utils = require('../utils/service.util');

const collectionName = 'gef-mandatoryCriteriaVersioned';

const sortMandatoryCriteria = (arr, callback) => {
  const sortedArray = arr.sort((a, b) => Number(a.version) - Number(b.version));
  return callback(sortedArray);
};

const findMandatoryCriteria = async (callback) => {
  const collection = await db.getCollection(collectionName);

  collection.find({}).toArray((err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};
exports.findMandatoryCriteria = findMandatoryCriteria;

const findOneMandatoryCriteria = async (id, callback) => {
  const collection = await db.getCollection(collectionName);
  collection.findOne({ _id: new ObjectID(String(id)) }, (err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

const findLatestMandatoryCriteria = async (callback) => {
  const collection = await db.getCollection(collectionName);
  collection.find({ isInDraft: false }).sort({ version: -1 }).limit(1).toArray((err, result) => {
    assert.equal(err, null);
    callback(result[0]);
  });
};

exports.create = async (req, res) => {
  const collection = await db.getCollection(collectionName);
  const mandatoryCriteria = await collection.insertOne(new MandatoryCriteria(req.body));

  res.status(201).send({ _id: mandatoryCriteria.insertedId });
};

exports.findAll = (req, res) => (
  findMandatoryCriteria((mandatoryCriteria) =>
    sortMandatoryCriteria(mandatoryCriteria, (sortedMandatoryCriteria) =>
      res.status(200).send({
        items: sortedMandatoryCriteria,
      })))
);

exports.findOne = (req, res) => (
  findOneMandatoryCriteria(
    req.params.id,
    (mandatoryCriteria) => res.status(200).send(mandatoryCriteria),
  )
);

exports.findLatest = (req, res) => (
  findLatestMandatoryCriteria(
    (mandatoryCriteria) => res.status(200).send(mandatoryCriteria),
  )
);

exports.update = async (req, res) => {
  const collection = await db.getCollection(collectionName);
  const update = req.body;
  update.updatedAt = Date.now();
  const response = await collection.findOneAndUpdate(
    { _id: ObjectID(req.params.id) },
    { $set: update },
    { returnOriginal: false },
  );

  res.status(utils.mongoStatus(response)).send(response.value ? response.value : null);
};

exports.delete = async (req, res) => {
  const collection = await db.getCollection(collectionName);
  const response = await collection.findOneAndDelete({ _id: new ObjectID(String(req.params.id)) });

  res.status(utils.mongoStatus(response)).send(response.value ? response.value : null);
};
