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

exports.getByVersion = async (req, res) => {
  const collection = await db.getCollection(collectionName);
  const item = await collection.findOne({ version: Number(req.params.version) });
  if (item) {
    res.status(200).send(item);
  } else {
    res.status(404).send();
  }
};

const getLatestCriteria = async () => {
  const collection = await db.getCollection(collectionName);

  const item = await collection.find({ isInDraft: false }).sort({ version: -1 }).limit(1).toArray();
  return item[0];
};
exports.getLatestCriteria = getLatestCriteria;

exports.getLatest = async (req, res) => {
  const doc = await getLatestCriteria();
  res.status(200).send(doc);
};

exports.create = async (req, res) => {
  const collection = await db.getCollection(collectionName);
  const criteria = await collection.insertOne(new EligibilityCriteria(req.body));
  res.status(201).send({ _id: criteria.insertedId });
};

exports.delete = async (req, res) => {
  const collection = await db.getCollection(collectionName);
  const response = await collection.findOneAndDelete({ version: Number(req.params.version) });
  res.status(utils.mongoStatus(response)).send(response.value ? response.value : null);
};
