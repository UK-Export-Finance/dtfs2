const assert = require('assert');

const db = require('../../drivers/db-client');

const sortMandatoryCriteria = (arr, callback) => {
  const sortedArray = arr.sort((a, b) => Number(a.id) - Number(b.id));
  return callback(sortedArray);
};

const findMandatoryCriteria = async (callback) => {
  const collection = await db.getCollection('mandatoryCriteria');

  collection.find({}).toArray((err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};
exports.findMandatoryCriteria = findMandatoryCriteria;

const findOneMandatoryCriteria = async (version, callback) => {
  const collection = await db.getCollection('mandatoryCriteria');
  collection.findOne({ version: Number(version) }, (err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

exports.create = async (req, res) => {
  const collection = await db.getCollection('mandatoryCriteria');
  const mandatoryCriteria = await collection.insertOne(req.body);

  res.status(200).send(mandatoryCriteria.ops[0]);
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
    req.params.version,
    (mandatoryCriteria) => res.status(200).send(mandatoryCriteria),
  )
);

const findLatestMandatoryCriteria = async () => {
  const collection = await db.getCollection('mandatoryCriteria');
  const latest = await collection.find({}).sort({ version: -1 }).limit(1).toArray();
  return latest[0];
};
exports.findLatestMandatoryCriteria = findLatestMandatoryCriteria;

exports.findLatest = async (req, res) => {
  const latest = await findLatestMandatoryCriteria();
  return res.status(200).send(latest);
};

exports.update = async (req, res) => {
  const collection = await db.getCollection('mandatoryCriteria');
  const status = await collection.updateOne({ version: { $eq: Number(req.params.version) } }, { $set: { criteria: req.body.criteria } }, {});
  res.status(200).send(status);
};

exports.delete = async (req, res) => {
  const collection = await db.getCollection('mandatoryCriteria');
  const status = await collection.deleteOne({ version: Number(req.params.version) });
  res.status(200).send(status);
};
