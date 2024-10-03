const { ObjectId } = require('mongodb');
const { PAYLOAD_VERIFICATION, MONGO_DB_COLLECTIONS, DocumentNotDeletedError } = require('@ukef/dtfs2-common');
const { isVerifiedPayload } = require('@ukef/dtfs2-common/payload-verification');
const assert = require('assert');
const { generateAuditDatabaseRecordFromAuditDetails, generatePortalAuditDetails, deleteOne } = require('@ukef/dtfs2-common/change-stream');
const { mongoDbClient: db } = require('../../drivers/db-client');
const { DEAL } = require('../../constants');

const sortEligibilityCriteria = (arr, callback) => {
  const sortedArray = arr.sort((a, b) => Number(a.id) - Number(b.id));
  return callback(sortedArray);
};

const findEligibilityCriteria = (callback) =>
  new Promise((resolve) => {
    db.getCollection(MONGO_DB_COLLECTIONS.ELIGIBILITY_CRITERIA).then((collection) => {
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

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.ELIGIBILITY_CRITERIA);
  collection.findOne({ $and: [{ version: { $eq: Number(version) } }, { product: DEAL.DEAL_TYPE.BSS_EWCS }] }, (error, result) => {
    assert.equal(error, null);
    callback(result);
  });
};

exports.create = async (req, res) => {
  if (!isVerifiedPayload({ payload: req?.body, template: PAYLOAD_VERIFICATION.CRITERIA.ELIGIBILITY })) {
    return res.status(400).send({ status: 400, message: 'Invalid eligibility criteria payload' });
  }

  const auditDetails = generatePortalAuditDetails(req.user._id);

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.ELIGIBILITY_CRITERIA);
  const criteria = { ...req?.body, auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails) };
  const eligibilityCriteria = await collection.insertOne(criteria);
  return res.status(200).send(eligibilityCriteria);
};

exports.findAll = (req, res) =>
  findEligibilityCriteria((eligibilityCriteria) =>
    sortEligibilityCriteria(eligibilityCriteria, (sortedEligibilityCriteria) =>
      res.status(200).send({
        count: eligibilityCriteria.length,
        eligibilityCriteria: sortedEligibilityCriteria,
      }),
    ),
  );

exports.findOne = (req, res) => findOneEligibilityCriteria(Number(req.params.version), (eligibilityCriteria) => res.status(200).send(eligibilityCriteria));

/**
 * Finds the latest (highest version number whose `isInDraft` is set to false) eligibility
 * criteria document from the 'eligibilityCriteria' collection.
 * EC is returned as an array for mapping.
 *
 * @returns {Promise<Object>} The latest eligibility criteria document.
 */
const getLatestEligibilityCriteria = async () => {
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.ELIGIBILITY_CRITERIA);
  const [latestEligibilityCriteria] = await collection
    .find({ $and: [{ product: { $eq: DEAL.DEAL_TYPE.BSS_EWCS } }, { isInDraft: { $eq: false } }] })
    .sort({ version: -1 })
    .limit(1)
    .toArray();

  return latestEligibilityCriteria;
};
exports.getLatestEligibilityCriteria = getLatestEligibilityCriteria;

exports.findLatestGET = async (req, res) => {
  const latest = await getLatestEligibilityCriteria();
  return res.status(200).send(latest);
};

exports.update = async (req, res) => {
  if (typeof req.params.version !== 'string') {
    return res.status(400).send({ status: 400, message: 'Invalid Version' });
  }

  const auditDetails = generatePortalAuditDetails(req.user._id);

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.ELIGIBILITY_CRITERIA);
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
    return res.status(400).send({ status: 400, message: 'Invalid eligibility criteria version number' });
  }
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.ELIGIBILITY_CRITERIA);
  const eligibilityCriteria = await collection.findOne({ version: { $eq: versionNumber } });

  if (!eligibilityCriteria) {
    return res.status(404).send({ status: 404, message: 'Eligibility criteria not found' });
  }

  try {
    const deleteResult = await deleteOne({
      documentId: new ObjectId(eligibilityCriteria._id),
      collectionName: MONGO_DB_COLLECTIONS.ELIGIBILITY_CRITERIA,
      db,
      auditDetails,
    });

    return res.status(200).send(deleteResult);
  } catch (error) {
    if (error instanceof DocumentNotDeletedError) {
      return res.status(404).send({ status: 404, message: 'Eligibility criteria not found' });
    }
    console.error('Error deleting eligibility criteria', error);
    return res.status(500).send({ status: 500, error });
  }
};
