const assert = require('assert');

const db = require('../../drivers/db-client');

const sortEligibilityCriteria = (arr, callback) => {
  const sortedArray = arr.sort((a, b) => Number(a.id) - Number(b.id));
  return callback(sortedArray);
};

const findEligibilityCriteria = (callback) => new Promise((resolve) => {
  db.getCollection('eligibilityCriteria')
    .then((collection) => {
      collection.find({}).toArray((err, result) => {
        assert.equal(err, null);
        resolve(result);
        if (callback) callback(result);
      });
    });
});
exports.findEligibilityCriteria = findEligibilityCriteria;

const findOneEligibilityCriteria = async (version, callback) => {
  const collection = await db.getCollection('eligibilityCriteria');
  collection.findOne({ version }, (err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

exports.create = async (req, res) => {
  const collection = await db.getCollection('eligibilityCriteria');
  const eligibilityCriteria = await collection.insertOne(req.body);
  res.status(200).send(eligibilityCriteria);
};

exports.findAll = (req, res) => (
  findEligibilityCriteria((eligibilityCriteria) =>
    sortEligibilityCriteria(eligibilityCriteria, (sortedEligibilityCriteria) =>
      res.status(200).send({
        count: eligibilityCriteria.length,
        eligibilityCriteria: sortedEligibilityCriteria,
      })))
);

exports.findOne = (req, res) => (
  findOneEligibilityCriteria(
    Number(req.params.version),
    (eligibilityCriteria) => res.status(200).send(eligibilityCriteria),
  )
);

const findLatest = async () => {
  const collection = await db.getCollection('eligibilityCriteria');
  const latest = await collection.find({}).sort({ version: -1 }).limit(1).toArray();
  return latest[0];
};
exports.findLatest = findLatest;

exports.findLatestGET = async (req, res) => {
  const latest = await findLatest();
  return res.status(200).send(latest);
};

exports.update = async (req, res) => {
  const collection = await db.getCollection('eligibilityCriteria');
  const status = await collection.updateOne({ version: Number(req.params.version)}, { $set: { criteria: req.body.criteria } }, {});
  res.status(200).send(status);
};

exports.delete = async (req, res) => {
  const collection = await db.getCollection('eligibilityCriteria');
  const status = await collection.deleteOne({ version: Number(req.params.version)});
  res.status(200).send(status);
};
