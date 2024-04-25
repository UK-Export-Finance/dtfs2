const assert = require('assert');
const { generatePortalUserAuditDatabaseRecord } = require('@ukef/dtfs2-common/src/helpers/change-stream/generate-audit-database-record');
const db = require('../../drivers/db-client');
const { PAYLOAD } = require('../../constants');
const payloadVerification = require('../helpers/payload');

const sortMandatoryCriteria = (arr, callback) => {
  const sortedArray = arr.sort((a, b) => Number(a.id) - Number(b.id));
  return callback(sortedArray);
};

const findMandatoryCriteria = async (callback) => {
  const collection = await db.getCollection('mandatoryCriteria');

  collection.find().toArray((error, result) => {
    assert.equal(error, null);
    callback(result);
  });
};
exports.findMandatoryCriteria = findMandatoryCriteria;

const findOneMandatoryCriteria = async (version, callback) => {
  if (typeof version !== 'string' || Number.isNaN(version)) {
    throw new Error('Invalid Version');
  }
  const versionAsNumber = Number(version);

  const collection = await db.getCollection('mandatoryCriteria');
  collection.findOne({ version: { $eq: versionAsNumber } }, (error, result) => {
    assert.equal(error, null);
    callback(result);
  });
};

exports.create = async (req, res) => {
  if (!payloadVerification(req.body, PAYLOAD.CRITERIA.MANDATORY.DEFAULT)) {
    return res.status(400).send({ status: 400, message: 'Invalid mandatory criteria payload' });
  }

  if (process.env.NODE_ENV === 'production') {
    return res.status(403).send({ status: 403, message: 'Unauthorised insertion' });
  }

  // MC insertion on non-production environments
    const collection = await db.getCollection('mandatoryCriteria');
    const criteria = { ...req?.body, auditRecord: generatePortalUserAuditDatabaseRecord(req.user._id)};
    const result = await collection.insertOne(criteria);

    return res.status(200).send(result);
};

exports.findAll = (req, res) => (
  findMandatoryCriteria((mandatoryCriteria) =>
    sortMandatoryCriteria(mandatoryCriteria, (sortedMandatoryCriteria) =>
      res.status(200).send({
        count: mandatoryCriteria.length,
        mandatoryCriteria: sortedMandatoryCriteria,
      })))
);

exports.findOne = (req, res) => (
  findOneMandatoryCriteria(
    req.params.version,
    (mandatoryCriteria) => res.status(200).send(mandatoryCriteria),
  )
);

const findLatestMandatoryCriteria = async () => {
  const collection = await db.getCollection('mandatoryCriteria');
  const latest = await collection.find().sort({ version: -1 }).limit(1).toArray();
  return latest[0];
};
exports.findLatestMandatoryCriteria = findLatestMandatoryCriteria;

exports.findLatest = async (req, res) => {
  const latest = await findLatestMandatoryCriteria();
  return res.status(200).send(latest);
};

exports.update = async (req, res) => {
  if (typeof req.params.version !== 'string') {
    res.status(400).send({ status: 400, message: 'Invalid Version' });
  }

  if (process.env.NODE_ENV === 'production') {
    return res.status(403).send();
  }

  // MC insertion on non-production environments
  const collection = await db.getCollection('mandatoryCriteria');
  const status = await collection.updateOne(
    { version: { $eq: Number(req.params.version) } },
    { $set: { criteria: req.body.criteria, auditRecord: generatePortalUserAuditDatabaseRecord(req.user._id) } },
    {},
  );
  return res.status(200).send(status);
};

exports.delete = async (req, res) => {
  const collection = await db.getCollection('mandatoryCriteria');
  const { version } = req.params;
  const versionNumber = Number(version);

  if (!Number.isNaN(versionNumber)) {
    const status = await collection.deleteOne({ version: { $eq: versionNumber } });
    return res.status(200).send(status);
  }

  return res.status(400).send({ status: 400, message: 'Invalid mandatory criteria version number' });
};
