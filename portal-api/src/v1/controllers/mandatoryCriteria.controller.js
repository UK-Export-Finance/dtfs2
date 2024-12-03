const { ObjectId } = require('mongodb');
const { PAYLOAD_VERIFICATION, MONGO_DB_COLLECTIONS, DocumentNotDeletedError } = require('@ukef/dtfs2-common');
const { isVerifiedPayload } = require('@ukef/dtfs2-common/payload-verification');
const assert = require('assert');
const { generatePortalAuditDetails, generateAuditDatabaseRecordFromAuditDetails, deleteOne } = require('@ukef/dtfs2-common/change-stream');

const { mongoDbClient: db } = require('../../drivers/db-client');

const sortMandatoryCriteria = (arr, callback) => {
  const sortedArray = arr.sort((a, b) => Number(a.id) - Number(b.id));
  return callback(sortedArray);
};

const findMandatoryCriteria = async (callback) => {
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.MANDATORY_CRITERIA);

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

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.MANDATORY_CRITERIA);
  collection.findOne({ version: { $eq: versionAsNumber } }, (error, result) => {
    assert.equal(error, null);
    callback(result);
  });
};

exports.create = async (req, res) => {
  if (!isVerifiedPayload({ payload: req.body, template: PAYLOAD_VERIFICATION.CRITERIA.MANDATORY.DEFAULT })) {
    return res.status(400).send({ status: 400, message: 'Invalid mandatory criteria payload' });
  }

  if (process.env.NODE_ENV === 'production') {
    return res.status(403).send({ status: 403, message: 'Unauthorised insertion' });
  }

  const auditDetails = generatePortalAuditDetails(req.user._id);

  // MC insertion on non-production environments
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.MANDATORY_CRITERIA);
  const criteria = { ...req?.body, auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails) };
  const result = await collection.insertOne(criteria);

  return res.status(200).send(result);
};

exports.findAll = (req, res) =>
  findMandatoryCriteria((mandatoryCriteria) =>
    sortMandatoryCriteria(mandatoryCriteria, (sortedMandatoryCriteria) =>
      res.status(200).send({
        count: mandatoryCriteria.length,
        mandatoryCriteria: sortedMandatoryCriteria,
      }),
    ),
  );

exports.findOne = (req, res) => findOneMandatoryCriteria(req.params.version, (mandatoryCriteria) => res.status(200).send(mandatoryCriteria));

const findLatestMandatoryCriteria = async () => {
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.MANDATORY_CRITERIA);
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

  const auditDetails = generatePortalAuditDetails(req.user._id);

  // MC insertion on non-production environments
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.MANDATORY_CRITERIA);
  const status = await collection.updateOne(
    { version: { $eq: Number(req.params.version) } },
    { $set: { criteria: req.body.criteria, auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails) } },
    {},
  );
  return res.status(200).send(status);
};

exports.delete = async (req, res) => {
  const versionNumber = Number(req.params.version);
  const auditDetails = generatePortalAuditDetails(req.user._id);

  if (Number.isNaN(versionNumber)) {
    return res.status(400).send({ status: 400, message: 'Invalid mandatory criteria version number' });
  }

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.MANDATORY_CRITERIA);
  const mandatoryCriteria = await collection.findOne({ version: { $eq: versionNumber } }, { projection: { _id: true } });

  if (!mandatoryCriteria) {
    return res.status(404).send({ status: 404, message: 'Mandatory Criteria not found' });
  }

  try {
    const deleteResult = await deleteOne({
      documentId: new ObjectId(mandatoryCriteria._id),
      collectionName: MONGO_DB_COLLECTIONS.MANDATORY_CRITERIA,
      db,
      auditDetails,
    });

    return res.status(200).send(deleteResult);
  } catch (error) {
    if (error instanceof DocumentNotDeletedError) {
      return res.status(404).send({ status: 404, message: 'Mandatory Criteria not found' });
    }
    console.error('Error occurred deleting mandatory criteria, %o', error);
    return res.status(500).send({ status: 500, error });
  }
};
