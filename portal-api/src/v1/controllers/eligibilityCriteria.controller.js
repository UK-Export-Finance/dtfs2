const { isVerifiedPayload } = require('@ukef/dtfs2-common');
const assert = require('assert');
const { generateAuditDatabaseRecordFromAuditDetails, generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const db = require('../../drivers/db-client');
const { PAYLOAD, DEAL } = require('../../constants');

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
  collection.findOne(
    { $and: [{ version: { $eq: Number(version) } }, { product: DEAL.DEAL_TYPE.BSS_EWCS }] },
    (error, result) => {
      assert.equal(error, null);
      callback(result);
    },
  );
};

exports.create = async (req, res) => {
  if (!isVerifiedPayload({ payload: req?.body, template: PAYLOAD.CRITERIA.ELIGIBILITY })) {
    return res.status(400).send({ status: 400, message: 'Invalid eligibility criteria payload' });
  }

  const auditDetails = generatePortalAuditDetails(req.user._id);

  const collection = await db.getCollection('eligibilityCriteria');
  const criteria = { ...req?.body, auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails)};
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

exports.findOne = (req, res) =>
  findOneEligibilityCriteria(Number(req.params.version), (eligibilityCriteria) =>
    res.status(200).send(eligibilityCriteria),
  );

/**
 * Finds the latest (highest version number whose `isInDraft` is set to false) eligibility
 * criteria document from the 'eligibilityCriteria' collection.
 * EC is returned as an array for mapping.
 *
 * @returns {Object} The latest eligibility criteria document.
 */
const getLatestEligibilityCriteria = async () => {
  const collection = await db.getCollection('eligibilityCriteria');
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

  const collection = await db.getCollection('eligibilityCriteria');
  const status = await collection.updateOne(
    { version: { $eq: Number(req.params.version) } },
    { $set: { criteria: req.body.criteria, auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails) } },
    {},
  );
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
