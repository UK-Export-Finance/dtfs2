const assert = require('assert');
const db = require('../../drivers/db-client');
const { PAYLOAD, DEAL } = require('../../constants');
const payloadVerification = require('../helpers/payload');

const sortEligibilityCriteria = (arr, callback) => {
  const sortedArray = arr.sort((a, b) => Number(a.id) - Number(b.id));
  return callback(sortedArray);
};

const findEligibilityCriteria = (callback) =>
  new Promise((resolve) => {
    db.getCollection('eligibilityCriteria').then((collection) => {
      collection.find({ product: { $eq: DEAL.DEAL_TYPE.BSS_EWCS } }).toArray((error, result) => {
        assert.equal(error, null);
        resolve(result);
        if (callback) callback(result);
      });
    });
  });
exports.findEligibilityCriteria = findEligibilityCriteria;

const findOneEligibilityCriteria = async (version, callback) => {
  if (typeof version !== 'number') {
    throw new Error('Invalid Version');
  }

  const collection = await db.getCollection('eligibilityCriteria');
  collection.findOne({ $and: [{ version: { $eq: Number(version) } }, { product: DEAL.DEAL_TYPE.BSS_EWCS }] }, (error, result) => {
    assert.equal(error, null);
    callback(result);
  });
};

exports.create = async (req, res) => {
  const criteria = req?.body;

  if (payloadVerification(criteria, PAYLOAD.CRITERIA.ELIGIBILITY)) {
    const collection = await db.getCollection('eligibilityCriteria');
    const eligibilityCriteria = await collection.insertOne(criteria);
    return res.status(200).send(eligibilityCriteria);
  }

  return res.status(400).send({ status: 400, message: 'Invalid eligibility criteria payload' });
};

exports.findAll = (req, res) =>
  findEligibilityCriteria((eligibilityCriteria) =>
    sortEligibilityCriteria(eligibilityCriteria, (sortedEligibilityCriteria) =>
      res.status(200).send({
        count: eligibilityCriteria.length,
        eligibilityCriteria: sortedEligibilityCriteria,
      })));

exports.findOne = (req, res) => findOneEligibilityCriteria(Number(req.params.version), (eligibilityCriteria) => res.status(200).send(eligibilityCriteria));

const findLatest = async () => {
  const collection = await db.getCollection('eligibilityCriteria');
  const latest = await collection.find({ product: { $eq: DEAL.DEAL_TYPE.BSS_EWCS } }).sort({ version: -1 }).limit(1).toArray();
  return latest[0];
};
exports.findLatest = findLatest;

exports.findLatestGET = async (req, res) => {
  const latest = await findLatest();
  return res.status(200).send(latest);
};

exports.update = async (req, res) => {
  if (typeof req.params.version !== 'string') {
    return res.status(400).send({ status: 400, message: 'Invalid Version' });
  }

  const collection = await db.getCollection('eligibilityCriteria');
  const status = await collection.updateOne({ version: { $eq: Number(req.params.version) } }, { $set: { criteria: req.body.criteria } }, {});
  return res.status(200).send(status);
};

exports.delete = async (req, res) => {
  const collection = await db.getCollection('eligibilityCriteria');
  const { version } = req.params;
  const versionNumber = Number(version);

  if (!Number.isNaN(versionNumber)) {
    const status = await collection.deleteOne({ version: { $eq: versionNumber } });
    return res.status(200).send(status);
  }

  return res.status(400).send({ status: 400, message: 'Invalid eligibility criteria version number' });
};
