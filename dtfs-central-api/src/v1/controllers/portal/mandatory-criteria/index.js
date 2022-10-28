const { ObjectId } = require('mongodb');

const { getCollection } = require('../../../../database/mongo-client');
const { DEAL_TYPE: { GEF, BSS_EWCS } } = require('../../../../constants/deals');

const collectionName = 'mandatoryCriteria';

exports.getOneMandatoryCriteria = async (req, res) => {
  const { version } = req.params;
  const { dealType } = req.query;

  const collection = await getCollection(collectionName);
  const criteria = await collection.findOne({ dealType, version });
  const status = criteria ? 200 : 404;
  return res.status(status).send(criteria);
};

const findLatest = async (dealType) => {
  const collection = await getCollection(collectionName);
  let criteria = {};

  if (dealType === GEF) {
    [criteria] = await collection.aggregate([{ $match: { dealType: GEF, isInDraft: false } }, { $sort: { version: -1 } }, { $limit: 1 }]).toArray();
  } else if (dealType === BSS_EWCS) {
    [criteria] = await collection.aggregate([{ $match: { dealType: BSS_EWCS } }, { $sort: { version: -1 } }, { $limit: 1 }]).toArray();
  }
  return criteria;
};

const findAll = async (dealType) => {
  const collection = await getCollection(collectionName);
  let criteria = [];

  if (dealType === GEF) {
    const query = await collection.aggregate([{ $match: { dealType: GEF } }, { $sort: { version: -1 } }]).toArray();
    criteria = { items: query };
  } else if (dealType === BSS_EWCS) {
    const query = await collection.aggregate([{ $match: { dealType: BSS_EWCS } }, { $sort: { version: -1 } }]).toArray();
    criteria = { count: query.length, mandatoryCriteria: query };
  } else {
    criteria = await collection.aggregate([{ $sort: { version: 1 } }]).toArray();
  }
  return criteria;
};

exports.getMandatoryCriteria = async (req, res) => {
  const { dealType, latest } = req.query;
  const status = 200;
  let criteria;
  if (dealType && latest) {
    criteria = await findLatest(dealType);
  } else {
    criteria = await findAll(dealType);
  }

  return res.status(status).send(criteria);
};

exports.postMandatoryCriteria = async (req, res) => {
  const payload = req.body;
  payload.updatedAt = Date.now();
  const collection = await getCollection(collectionName);
  const response = await collection.insertOne(payload);
  const mandatoryCriteria = await collection.findOne({ _id: ObjectId(response.insertedId) });
  return res.status(200).send(mandatoryCriteria);
};

exports.putMandatoryCriteria = async (req, res) => {
  const { dealType } = req.query;
  const { version } = req.params;

  const payload = req.body;
  payload.updatedAt = Date.now();

  const collection = await getCollection(collectionName);

  const response = await collection.findOneAndUpdate(
    { version, dealType },
    { $set: req.body },
    { returnDocument: 'after', returnNewDocument: true }
  );
  return res.status(200).send(response.value);
};

exports.deleteMandatoryCriteria = async (req, res) => {
  const { dealType } = req.query;
  const { version } = req.params;

  const collection = await getCollection(collectionName);
  const response = await collection.deleteOne({ version, dealType });
  const status = response ? 200 : 404;
  return res.status(status).send();
};
