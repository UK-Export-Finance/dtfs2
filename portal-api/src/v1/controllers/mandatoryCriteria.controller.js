const { HttpStatusCode } = require('axios');
const { ObjectId } = require('mongodb');
const { PAYLOAD_VERIFICATION, MONGO_DB_COLLECTIONS, DocumentNotDeletedError, isProduction } = require('@ukef/dtfs2-common');
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

/**
 * Finds a single mandatory criteria document by version.
 *
 * @param {string} version - The version of the mandatory criteria to find. Must be a string that can be converted to a number.
 * @param {function} callback - A callback function to handle the result. Receives the found document as an argument.
 * @throws {Error} Throws an error if the version is not a valid string or cannot be converted to a number.
 * @returns {void} This function does not return a value; the result is passed to the callback.
 */
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

/**
 * Creates a new mandatory criteria.
 *
 * @param {Express.Request} req - The Express request object.
 * @param {Express.Response} res - The Express response object.
 * @returns {Promise<Express.Response>} - A promise that resolves to the Express response object.
 */
exports.create = async (req, res) => {
  if (!isVerifiedPayload({ payload: req.body, template: PAYLOAD_VERIFICATION.CRITERIA.MANDATORY.DEFAULT })) {
    return res.status(HttpStatusCode.BadRequest).send({ status: HttpStatusCode.BadRequest, message: 'Invalid mandatory criteria payload' });
  }

  if (isProduction()) {
    return res.status(HttpStatusCode.Unauthorized).send({ status: HttpStatusCode.Unauthorized, message: 'Unauthorised insertion' });
  }

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.MANDATORY_CRITERIA);
  const auditDetails = generatePortalAuditDetails(req.user._id);

  // MC insertion on non-production environments
  const criteria = { ...req.body, auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails) };
  const result = await collection.insertOne(criteria);

  return res.status(HttpStatusCode.Created).send(result);
};

/**
 * Retrieves all mandatory criteria.
 *
 * @param {Express.Request} req - The Express request object.
 * @param {Express.Response} res - The Express response object.
 * @returns {void}
 */
exports.findAll = (req, res) =>
  findMandatoryCriteria((mandatoryCriteria) =>
    sortMandatoryCriteria(mandatoryCriteria, (sortedMandatoryCriteria) =>
      res.status(200).send({
        count: mandatoryCriteria.length,
        mandatoryCriteria: sortedMandatoryCriteria,
      }),
    ),
  );

/**
 * Finds a mandatory criteria by its version.
 *
 * @param {Express.Request} req - The Express request object.
 * @param {Express.Response} res - The Express response object.
 * @returns {void}
 */
exports.findOne = (req, res) => findOneMandatoryCriteria(req.params.version, (mandatoryCriteria) => res.status(200).send(mandatoryCriteria));

/**
 * Finds the latest mandatory criteria.
 * @returns {Promise<Object>} - A promise that resolves to the latest mandatory criteria.
 */
const findLatestMandatoryCriteria = async () => {
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.MANDATORY_CRITERIA);
  const latest = await collection.find().sort({ version: -1 }).limit(1).toArray();
  return latest[0];
};
exports.findLatestMandatoryCriteria = findLatestMandatoryCriteria;

/**
 * Finds the latest mandatory criteria and sends it as a response.
 *
 * @param {Express.Request} req - The Express request object.
 * @param {Express.Response} res - The Express response object.
 * @returns {Promise<Express.Response>} - A promise that resolves to the Express response object.
 */
exports.findLatest = async (req, res) => {
  const latest = await findLatestMandatoryCriteria();
  return res.status(200).send(latest);
};

/**
 * Deletes a mandatory criteria.
 *
 * @param {Express.Request} req - The Express request object.
 * @param {Express.Response} res - The Express response object.
 * @returns {Promise<Express.Response>} - A promise that resolves to the Express response object.
 */
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
