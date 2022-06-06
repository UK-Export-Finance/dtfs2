const assert = require('assert');
const { ObjectId } = require('mongodb');

const db = require('../../../drivers/db-client');
const { MandatoryCriteria } = require('../models/mandatoryCriteria');
const utils = require('../utils.service');
const api = require('../../api');

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
  collection.findOne({ _id: ObjectId(String(id)) }, (err, result) => {
    assert.equal(err, null);
    callback(result);
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

exports.findLatest = async (req, res) => {
  const criteria = await api.findLatestGefMandatoryCriteria();
  if (criteria.status === 200) {
    return res.status(200).send(criteria.data);
  }
  return res.status(criteria.status).send();
};

exports.update = async (req, res) => {
  const collection = await db.getCollection(collectionName);
  const update = req.body;
  update.updatedAt = Date.now();
  const response = await collection.findOneAndUpdate(
    { _id: ObjectId(req.params.id) },
    { $set: update },
    { returnOriginal: false },
  );

  res.status(utils.mongoStatus(response)).send(response.value ? response.value : null);
};

exports.delete = async (req, res) => {
  const collection = await db.getCollection(collectionName);
  const response = await collection.findOneAndDelete({ _id: ObjectId(String(req.params.id)) });

  res.status(utils.mongoStatus(response)).send(response.value ? response.value : null);
};
