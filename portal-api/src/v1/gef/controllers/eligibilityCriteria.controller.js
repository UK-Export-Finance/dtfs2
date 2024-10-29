const { ObjectId } = require('mongodb');
const { PAYLOAD_VERIFICATION, MONGO_DB_COLLECTIONS, DocumentNotDeletedError } = require('@ukef/dtfs2-common');
const { isVerifiedPayload } = require('@ukef/dtfs2-common/payload-verification');
const { generateAuditDatabaseRecordFromAuditDetails, generatePortalAuditDetails, deleteOne } = require('@ukef/dtfs2-common/change-stream');
const { EligibilityCriteria } = require('../models/eligibilityCriteria');
const { mongoDbClient: db } = require('../../../drivers/db-client');
const { DEAL } = require('../../../constants');

const sortByVersion = (arr, callback) => {
  const sortedArray = arr.sort((a, b) => Number(a.version) - Number(b.version));
  return callback(sortedArray);
};

exports.getAll = async (req, res) => {
  const collection = await db.getCollection('eligibilityCriteria');

  const items = await collection.find({ product: DEAL.DEAL_TYPE.GEF }).toArray();

  sortByVersion(items, (sortedMandatoryCriteria) => {
    res.status(200).send({
      items: sortedMandatoryCriteria,
    });
  });
};

exports.getByVersion = async (req, res) => {
  const { version } = req.params;

  if (typeof version !== 'string') {
    return res.status(400).send({ status: 400, message: 'Invalid Version' });
  }

  const collection = await db.getCollection('eligibilityCriteria');
  const item = await collection.findOne({
    $and: [{ version: { $eq: Number(version) } }, { product: { $eq: DEAL.DEAL_TYPE.GEF } }],
  });

  return item ? res.status(200).send(item) : res.status(404).send();
};

/**
 * Finds the latest (highest version number whose `isInDraft` is set to false) eligibility
 * criteria document from the 'eligibilityCriteria' collection.
 * EC is returned as an array for mapping.
 *
 * @returns {Promise<import('@ukef/dtfs2-common').GefDeal['eligibility']>} The latest eligibility criteria document.
 */
const getLatestEligibilityCriteria = async () => {
  const collection = await db.getCollection('eligibilityCriteria');

  const [latestEligibilityCriteria] = await collection
    .find({ $and: [{ isInDraft: { $eq: false } }, { product: { $eq: DEAL.DEAL_TYPE.GEF } }] })
    .sort({ version: -1 })
    .limit(1)
    .toArray();

  return latestEligibilityCriteria;
};
exports.getLatestEligibilityCriteria = getLatestEligibilityCriteria;

exports.getLatest = async (req, res) => {
  const doc = await getLatestEligibilityCriteria();
  res.status(200).send(doc);
};

exports.create = async (req, res) => {
  const collection = await db.getCollection('eligibilityCriteria');
  if (!isVerifiedPayload({ payload: req.body, template: PAYLOAD_VERIFICATION.CRITERIA.ELIGIBILITY })) {
    return res.status(400).send({ status: 400, message: 'Invalid GEF eligibility criteria payload' });
  }

  const auditDetails = generatePortalAuditDetails(req.user._id);

  const criteria = { ...req?.body, auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails) };
  const result = await collection.insertOne(new EligibilityCriteria(criteria));
  return res.status(201).send({ _id: result.insertedId });
};

exports.delete = async (req, res) => {
  const auditDetails = generatePortalAuditDetails(req.user._id);

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.ELIGIBILITY_CRITERIA);
  const criteria = await collection.findOne({ version: { $eq: Number(req.params.version) } });

  if (!criteria) {
    return res.status(404).send({ status: 404, message: 'Eligibility criteria not found' });
  }

  try {
    const deleteResponse = await deleteOne({
      documentId: new ObjectId(criteria._id),
      collectionName: MONGO_DB_COLLECTIONS.ELIGIBILITY_CRITERIA,
      db,
      auditDetails,
    });

    return res.status(200).send(deleteResponse);
  } catch (error) {
    if (error instanceof DocumentNotDeletedError) {
      return res.status(404).send({ status: 404, message: 'Eligibility criteria not found' });
    }
    console.error(error);
    return res.status(500).send({ status: 500, error });
  }
};
