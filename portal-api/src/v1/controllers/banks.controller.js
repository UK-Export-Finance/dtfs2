const assert = require('assert');

const db = require('../../drivers/db-client');

const findBanks = async (callback) => {
  const collection = await db.getCollection('banks');

  collection.find({}).toArray((err, result) => {
    assert.strictEqual(err, null);
    callback(result);
  });
};

const findOneBank = async (id, callback) => {
  const collection = await db.getCollection('banks');

  if (!callback) {
    return collection.findOne({ id });
  }

  return collection.findOne({ id }, (err, result) => {
    assert.strictEqual(err, null);
    callback(result);
  });
};
exports.findOneBank = findOneBank;

exports.create = async (req, res) => {
  const collection = await db.getCollection('banks');
  const bank = await collection.insertOne(req.body);

  res.status(200).json(bank);
};

exports.findAll = (req, res) => (
  findBanks((banks) => res.status(200).send({
    count: banks.length,
    banks,
  }))
);

exports.findOne = (req, res) => (
  findOneBank(req.params.id, (deal) => res.status(200).send(deal))
);

exports.update = async (req, res) => {
  const collection = await db.getCollection('banks');
  const updatedBank = await collection.updateOne({ id: { $eq: req.params.id } }, { $set: req.body }, {});

  res.status(200).json(updatedBank);
};

exports.delete = async (req, res) => {
  const collection = await db.getCollection('banks');
  const status = await collection.deleteOne({ id: req.params.id });
  res.status(200).send(status);
};
