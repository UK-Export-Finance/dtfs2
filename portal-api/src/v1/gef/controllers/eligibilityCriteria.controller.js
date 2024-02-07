const { EligibilityCriteria } = require('../models/eligibilityCriteria');
const db = require('../../../drivers/db-client');
const utils = require('../utils.service');
const { PAYLOAD, DEAL } = require('../../../constants');
const payloadVerification = require('../../helpers/payload');

const sortByVersion = (arr, callback) => {
  const sortedArray = arr.sort((a, b) => Number(a.version) - Number(b.version));
  return callback(sortedArray);
};

exports.getAll = async (req, res) => {
  const collection = await db.getCollection('eligibilityCriteria');

  const items = await collection.find({ product: DEAL.DEAL_TYPE.GEF }).toArray();

  sortByVersion(items, (sortedMandatoryCriteria) => {
    res.status(200).send({
      items: sortedMandatoryCriteria,
    });
  });
};

exports.getByVersion = async (req, res) => {
  const { version } = req.params;

  if (typeof version !== 'string') {
    return res.status(400).send({ status: 400, message: 'Invalid Version' });
  }

  const collection = await db.getCollection('eligibilityCriteria');
  const item = await collection.findOne({ $and: [{ version: { $eq: Number(version) } }, { product: { $eq: DEAL.DEAL_TYPE.GEF } }] });

  return item ? res.status(200).send(item) : res.status(404).send();
};

/**
 * Retrieves the latest eligibility criteria from the database.
 * EC is returned as an array for mapping.
 * 
 * @returns {Promise<Object>} The latest eligibility criteria object.
 */
const getLatestCriteria = async () => {
  const collection = await db.getCollection('eligibilityCriteria');

  const [item] = await collection
    .find({ $and: [{ isInDraft: { $eq: false } }, { product: { $eq: DEAL.DEAL_TYPE.GEF } }] })
    .sort({ version: -1 })
    .limit(1)
    .toArray();

  return item;
};
exports.getLatestCriteria = getLatestCriteria;

exports.getLatest = async (req, res) => {
  const doc = await getLatestCriteria();
  res.status(200).send(doc);
};

exports.create = async (req, res) => {
  const collection = await db.getCollection('eligibilityCriteria');
  const criteria = req?.body;

  if (payloadVerification(criteria, PAYLOAD.CRITERIA.ELIGIBILITY)) {
    const result = await collection.insertOne(new EligibilityCriteria(criteria));
    return res.status(201).send({ _id: result.insertedId });
  }

  return res.status(400).send({ status: 400, message: 'Invalid GEF eligibility criteria payload' });
};

exports.delete = async (req, res) => {
  const collection = await db.getCollection('eligibilityCriteria');
  const response = await collection.findOneAndDelete({ version: { $eq: Number(req.params.version) } });
  res.status(utils.mongoStatus(response)).send(response.value ? response.value : null);
};
