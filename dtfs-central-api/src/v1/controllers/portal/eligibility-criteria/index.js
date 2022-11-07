const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');

const { getCollection } = require('../../../../database/mongo-client');
const { DEAL_TYPE: { GEF, BSS_EWCS } } = require('../../../../constants/deals');

const collectionName = 'eligibilityCriteria';

exports.getOneEligibilityCriteria = async (req, res) => {
  const { version } = req.params;
  const { dealType, } = req.query;

  const collection = await getCollection(collectionName);
  const criteria = await collection.findOne({ dealType, version });

  const status = criteria ? 200 : 404;
  return res.status(status).send(criteria);
};

const findLatest = async (dealType) => {
  const collection = await getCollection(collectionName);
  const [criteria] = await collection.aggregate([{ $match: { dealType } }, { $sort: { version: -1 } }, { $limit: 1 }]).toArray();
  return criteria;
};

const findAll = async (dealType) => {
  const collection = await getCollection(collectionName);

  let filter = {};
  if (dealType === GEF || dealType === BSS_EWCS) {
    filter = { $match: { dealType } };
  }

  const criteria = await collection.aggregate([filter, { $sort: { version: -1 } }]).toArray();
  return criteria;
};

exports.getEligibilityCriteria = async (req, res) => {
  const { dealType, latest } = req.query;

  let criteria;
  if (dealType && latest) {
    criteria = await findLatest(dealType);
  } else {
    criteria = await findAll(dealType);
  }

  const status = criteria ? 200 : 404;
  return res.status(status).send(criteria);
};

exports.postEligibilityCriteria = async (req, res) => {
  const payload = req.body;
  payload.updatedAt = Date.now();
  payload.createdAt = Date.now();

  const collection = await getCollection(collectionName);
  const response = await collection.insertOne(payload);
  const criteria = await collection.findOne({ _id: ObjectId(response.insertedId) });
  const status = criteria ? 200 : 404;
  return res.status(status).send(criteria);
};

exports.putEligibilityCriteria = async (req, res) => {
  const { dealType } = req.query;
  const { version } = req.params;

  const payload = req.body;
  payload.updatedAt = Date.now();

  const collection = await getCollection(collectionName);
  const response = await collection.findOneAndUpdate(
    { version, dealType },
    $.flatten(payload),
    { returnDocument: 'after', returnNewDocument: true }
  );

  return res.status(200).send(response.value);
};

exports.deleteEligibilityCriteria = async (req, res) => {
  const { dealType } = req.query;
  const { version } = req.params;

  const collection = await getCollection(collectionName);
  const response = await collection.deleteOne({ version, dealType });
  const status = response ? 200 : 404;
  return res.status(status).send();
};
