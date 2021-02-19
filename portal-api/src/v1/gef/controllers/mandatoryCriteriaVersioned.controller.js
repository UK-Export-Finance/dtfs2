const assert = require('assert');

const db = require('../../../drivers/db-client');

const sortMandatoryCriteria = (arr, callback) => {
  const sortedArray = arr.sort((a, b) => Number(a.version) - Number(b.version));
  return callback(sortedArray);
};

const findMandatoryCriteria = async (callback) => {
  const collection = await db.getCollection('gef-mandatoryCriteriaVersioned');

  collection.find({}).toArray((err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};
exports.findMandatoryCriteria = findMandatoryCriteria;

const findOneMandatoryCriteria = async (id, callback) => {
  const collection = await db.getCollection('gef-mandatoryCriteriaVersioned');
  collection.findOne({ id }, (err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

const findLatestMandatoryCriteria = async (callback) => {
  const collection = await db.getCollection('gef-mandatoryCriteriaVersioned');
  collection.find({ isInDraft: false }).sort({ version: -1 }).limit(1).toArray((err, result) => {
    console.log('findLatestMandatoryCriteria error', { err: JSON.stringify(err, null, 4) });
    assert.equal(err, null);
    callback(result[0]);
  });
};

exports.create = async (req, res) => {
  const collection = await db.getCollection('gef-mandatoryCriteriaVersioned');
  const mandatoryCriteria = await collection.insertOne(req.body);

  res.status(200).send(mandatoryCriteria);
};

exports.findAll = (req, res) => (
  findMandatoryCriteria((mandatoryCriteria) =>
    sortMandatoryCriteria(mandatoryCriteria, (sortedMandatoryCriteria) =>
      res.status(200).send({
        count: mandatoryCriteria.length,
        mandatoryCriteria: sortedMandatoryCriteria,
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
  const collection = await db.getCollection('gef-mandatoryCriteriaVersioned');
  const status = await collection.updateOne({ id: { $eq: req.params.id } }, { $set: req.body }, {});
  res.status(200).send(status);
};

exports.delete = async (req, res) => {
  const collection = await db.getCollection('gef-mandatoryCriteriaVersioned');
  const status = await collection.deleteOne({ id: req.params.id });
  res.status(200).send(status);
};
