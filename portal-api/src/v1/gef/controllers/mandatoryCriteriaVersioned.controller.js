const { PAYLOAD_VERIFICATION } = require('@ukef/dtfs2-common');
const { isVerifiedPayload } = require('@ukef/dtfs2-common/payload-verification');
const assert = require('assert');
const { ObjectId } = require('mongodb');
const { generateAuditDatabaseRecordFromAuditDetails, generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { MandatoryCriteria } = require('../models/mandatoryCriteria');
const { mongoDbClient: db } = require('../../../drivers/db-client');
const utils = require('../utils.service');
const api = require('../../api');

const collectionName = 'gef-mandatoryCriteriaVersioned';

const sortMandatoryCriteria = (arr, callback) => {
  const sortedArray = arr.sort((a, b) => Number(a.version) - Number(b.version));
  return callback(sortedArray);
};

const findMandatoryCriteria = async (callback) => {
  const collection = await db.getCollection(collectionName);

  collection.find().toArray((error, result) => {
    assert.equal(error, null);
    callback(result);
  });
};
exports.findMandatoryCriteria = findMandatoryCriteria;

const findOneMandatoryCriteria = async (id, callback) => {
  const idAsString = String(id);

  if (!ObjectId.isValid(idAsString)) {
    throw new Error('Invalid Mandatory Criteria Id');
  }

  const collection = await db.getCollection(collectionName);
  collection.findOne({ _id: { $eq: ObjectId(idAsString) } }, (error, result) => {
    assert.equal(error, null);
    callback(result);
  });
};

exports.create = async (req, res) => {
  const collection = await db.getCollection(collectionName);

  if (!isVerifiedPayload({ payload: req.body, template: PAYLOAD_VERIFICATION.CRITERIA.MANDATORY.VERSIONED })) {
    return res.status(400).send({ status: 400, message: 'Invalid GEF mandatory criteria payload' });
  }

  const auditDetails = generatePortalAuditDetails(req.user._id);

  const criteria = { ...req.body, auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails) };
  const { insertedId } = await collection.insertOne(new MandatoryCriteria(criteria));
  return res.status(201).send({ _id: insertedId });
};

exports.findAll = (req, res) =>
  findMandatoryCriteria((mandatoryCriteria) =>
    sortMandatoryCriteria(mandatoryCriteria, (sortedMandatoryCriteria) =>
      res.status(200).send({
        items: sortedMandatoryCriteria,
      }),
    ),
  );

exports.findOne = (req, res) => findOneMandatoryCriteria(req.params.id, (mandatoryCriteria) => res.status(200).send(mandatoryCriteria));

exports.findLatest = async (req, res) => {
  const criteria = await api.findLatestGefMandatoryCriteria();
  if (criteria.status === 200) {
    return res.status(200).send(criteria.data);
  }
  return res.status(criteria.status).send();
};

exports.update = async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ status: 400, message: 'Invalid Id' });
  }

  const auditDetails = generatePortalAuditDetails(req.user._id);

  const collection = await db.getCollection(collectionName);
  const update = req.body;
  update.updatedAt = Date.now();
  update.auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);
  const response = await collection.findOneAndUpdate({ _id: { $eq: ObjectId(id) } }, { $set: update }, { returnNewDocument: true, returnDocument: 'after' });

  return res.status(utils.mongoStatus(response)).send(response.value ? response.value : null);
};

exports.delete = async (req, res) => {
  if (!ObjectId.isValid(String(req.params.id))) {
    return res.status(400).send({ status: 400, message: 'Invalid Mandatory Criteria Id' });
  }

  const collection = await db.getCollection(collectionName);
  const response = await collection.findOneAndDelete({ _id: { $eq: ObjectId(String(req.params.id)) } });

  return res.status(utils.mongoStatus(response)).send(response.value ? response.value : null);
};
