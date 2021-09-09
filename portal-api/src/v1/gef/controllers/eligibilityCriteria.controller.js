const { ObjectID } = require('bson');

const db = require('../../../drivers/db-client');
const { EligibilityCriteria } = require('../models/eligibilityCriteria');
const utils = require('../utils.service');

const collectionName = 'gef-eligibilityCriteria';

const sortByVersion = (arr, callback) => {
  const sortedArray = arr.sort((a, b) => Number(a.version) - Number(b.version));
  return callback(sortedArray);
};

exports.getAll = async (req, res) => {
  const collection = await db.getCollection(collectionName);

  const items = await collection.find({}).toArray();

  sortByVersion(items, (sortedMandatoryCriteria) => {
    res.status(200).send({
      items: sortedMandatoryCriteria,
    });
  });
};

exports.getById = async (req, res) => {
  const collection = await db.getCollection(collectionName);
  const item = await collection.findOne({ _id: new ObjectID(String(req.params.id)) });
  if (item) {
    res.status(200).send(item);
  } else {
    res.status(204).send();
  }
};

exports.getLatest = async (req, res) => {
  const collection = await db.getCollection(collectionName);
  const item = await collection.find({ isInDraft: false }).sort({ version: -1 }).limit(1).toArray();
  res.status(200).send(item[0]);
};

exports.create = async (req, res) => {
  const collection = await db.getCollection(collectionName);
  const item = await collection.insertOne(new EligibilityCriteria(req.body));
  res.status(201).send(item.ops[0]);
};

exports.delete = async (req, res) => {
  const collection = await db.getCollection(collectionName);
  const response = await collection.findOneAndDelete({ _id: new ObjectID(String(req.params.id)) });
  res.status(utils.mongoStatus(response)).send(response.value ? response.value : null);
};
