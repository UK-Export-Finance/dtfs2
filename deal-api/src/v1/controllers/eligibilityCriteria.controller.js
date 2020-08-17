const assert = require('assert');

const db = require('../../drivers/db-client');

const sortEligibilityCriteria = (arr, callback) => {
  const sortedArray = arr.sort((a, b) => Number(a.id) - Number(b.id));
  return callback(sortedArray);
};

const findEligibilityCriteria = async (callback) => {
  const collection = await db.getCollection('eligibilityCriteria');

  collection.find({}).toArray((err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};
exports.findEligibilityCriteria = findEligibilityCriteria;

const findOneEligibilityCriteria = async (id, callback) => {
  const collection = await db.getCollection('eligibilityCriteria');
  collection.findOne({ id }, (err, result) => {
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
    req.params.id,
    (eligibilityCriteria) => res.status(200).send(eligibilityCriteria),
  )
);

exports.update = async (req, res) => {
  const collection = await db.getCollection('eligibilityCriteria');
  const status = await collection.updateOne({ id: { $eq: req.params.id } }, { $set: req.body }, {});
  res.status(200).send(status);
};

exports.delete = async (req, res) => {
  const collection = await db.getCollection('eligibilityCriteria');
  const status = await collection.deleteOne({ id: req.params.id });
  res.status(200).send(status);
};
