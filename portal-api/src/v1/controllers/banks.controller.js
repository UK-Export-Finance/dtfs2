const assert = require('assert');
const { ObjectId } = require('mongodb');
const { hasValidObjectId } = require('../validation/validateObjectId');

const db = require('../../drivers/db-client');

const findBanks = async (callback) => {
  const collection = await db.getCollection('banks');

  collection.find({}).toArray((err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

const findOneBank = async (id, callback) => {
  const collection = await db.getCollection('banks');

  if (!callback) {
    return collection.findOne({ id });
  }

  return collection.findOne({ id }, (err, result) => {
    assert.equal(err, null);
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

// validate the user's bank against the deal
exports.validateBank = async (req, res) => {
  const { dealId, bankId } = req.body;

  // check if the `dealId` is a valid ObjectId
  if (hasValidObjectId(dealId)) {
    const collection = await db.getCollection('deals');

    // validate the bank against the deal
    const isValid = await collection.findOne({ _id: ObjectId(dealId), 'bank.id': bankId });

    if (isValid) {
      return res.status(200).send({ status: 200, isValid: true });
    }
    return res.status(404).send({ status: 404, isValid: false });
  }
  return res.status(400).send({ status: 400, isValid: false });
};
