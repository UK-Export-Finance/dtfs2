const { ObjectId } = require('mongodb');

const { getCollection } = require('../../../../database/mongo-client');
const { DEAL_TYPE: { GEF, BSS_EWCS } } = require('../../../../constants/deals');

const collectionName = 'eligibilityCriteria';

const findOne = async (dealType, version) => {
  const collection = await getCollection(collectionName);
  return collection.findOne({ dealType, version });
};

exports.getOneEligibilityCriteria = async (req, res) => {
  const { version } = req.params;
  const { dealType, } = req.query;
  const criteria = await findOne(dealType, version);
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
    criteria = await collection.aggregate([{ $match: { dealType: GEF } }, { $sort: { version: -1 } }]).toArray();
    criteria = { items: criteria };
  } else if (dealType === BSS_EWCS) {
    criteria = await collection.aggregate([{ $match: { dealType: BSS_EWCS } }, { $sort: { version: -1 } }]).toArray();
    criteria = { count: criteria.length, eligibilityCriteria: criteria };
  } else {
    criteria = await collection.aggregate([{ $sort: { version: 1 } }]).toArray();
  }
  return criteria;
};

exports.getEligibilityCriteria = async (req, res) => {
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

exports.postEligibilityCriteria = async (req, res) => {
  const payload = req.body;
  payload.updatedAt = Date.now();
  const collection = await getCollection(collectionName);
  const response = await collection.insertOne(payload);
  const eligibilityCriteria = await collection.findOne({ _id: ObjectId(response.insertedId) });
  return res.status(200).send(eligibilityCriteria);
};

exports.putEligibilityCriteria = async (req, res) => {
  const { dealType } = req.query;
  const { version } = req.params;

  let response = {};
  const payload = req.body;
  payload.updatedAt = Date.now();

  const collection = await getCollection(collectionName);
  if (dealType === GEF) {
    response = await collection.findOneAndUpdate(
      { _id: ObjectId(version), dealType: GEF },
      { $set: req.body },
      { returnDocument: 'after', returnNewDocument: true }
    );
    response = response.value;
  }

  if (dealType === BSS_EWCS) {
    response = await collection.updateOne({ version, dealType: BSS_EWCS }, { $set: { criteria: payload.criteria } }, {});
  }
  return res.status(200).send(response);
};

exports.deleteEligibilityCriteria = async (req, res) => {
  const { dealType } = req.query;
  const { version } = req.params;
  let response;

  const collection = await getCollection(collectionName);
  if (dealType === GEF) {
    response = await collection.findOneAndDelete({ version, dealType: GEF });
    response = response.value;
  }

  if (dealType === BSS_EWCS) {
    response = await collection.deleteOne({ version, dealType: BSS_EWCS });
    response = response.value;
  }
  return res.status(200).send(response);
};
