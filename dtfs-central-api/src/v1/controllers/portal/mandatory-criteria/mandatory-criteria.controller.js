const { ObjectId } = require('mongodb');

const { getCollection } = require('../../../../database/mongo-client');
const { DEAL_TYPE: { GEF, BSS_EWCS } } = require('../../../../constants/deals');

const collectionName = 'mandatoryCriteria';

const findOne = async (dealType, id) => {
  const collection = await getCollection(collectionName);
  return collection.findOne({ dealType, version: Number(id) });
};

exports.getOneMandatoryCriteria = async (req, res) => {
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
    criteria = { count: criteria.length, mandatoryCriteria: criteria };
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
  return res.status(200).send({ _id: response.insertedId });
};

exports.putMandatoryCriteria = async (req, res) => {
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
      { returnDocument: 'after' },
    );
    response = response.value;
  }

  if (dealType === BSS_EWCS) {
    response = await collection.updateOne({ version: { $eq: Number(version) }, dealType: BSS_EWCS }, { $set: { criteria: payload.criteria } }, {});
  }
  return res.status(200).send(response);
};

exports.deleteMandatoryCriteria = async (req, res) => {
  const { dealType } = req.query;
  const { version } = req.params;
  let response;

  const collection = await getCollection(collectionName);
  if (dealType === GEF) {
    response = await collection.findOneAndDelete({ _id: ObjectId(version), dealType: GEF });
    response = response.value;
  }

  if (dealType === BSS_EWCS) {
    response = await collection.deleteOne({ version: Number(version), dealType: BSS_EWCS });
    response = response.value;
  }
  return res.status(200).send(response);
};
