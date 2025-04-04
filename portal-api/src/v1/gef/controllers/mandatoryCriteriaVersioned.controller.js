const { HttpStatusCode } = require('axios');
const { PAYLOAD_VERIFICATION, MONGO_DB_COLLECTIONS, DocumentNotDeletedError, isProduction } = require('@ukef/dtfs2-common');
const { isVerifiedPayload } = require('@ukef/dtfs2-common/payload-verification');
const assert = require('assert');
const { ObjectId } = require('mongodb');
const { generateAuditDatabaseRecordFromAuditDetails, generatePortalAuditDetails, deleteOne } = require('@ukef/dtfs2-common/change-stream');
const { MandatoryCriteria } = require('../models/mandatoryCriteria');
const { mongoDbClient: db } = require('../../../drivers/db-client');
const api = require('../../api');

const sortMandatoryCriteria = (arr, callback) => {
  const sortedArray = arr.sort((a, b) => Number(a.version) - Number(b.version));
  return callback(sortedArray);
};

/**
 * Retrieves all mandatory criteria versions.
 * @param {Function} callback - Callback function to process the retrieved mandatory criteria.
 */
const findMandatoryCriteria = async (callback) => {
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.GEF_MANDATORY_CRITERIA_VERSIONED);

  collection.find().toArray((error, result) => {
    assert.equal(error, null);
    callback(result);
  });
};
exports.findMandatoryCriteria = findMandatoryCriteria;

/**
 * Retrieves a specific mandatory criteria version by its ID.
 * @param {String} id - The ID of the mandatory criteria to retrieve.
 * @param {Function} callback - Callback function to process the retrieved mandatory criteria.
 * @throws {Error} - If the provided ID is invalid.
 */
const findOneMandatoryCriteria = async (id, callback) => {
  const idAsString = String(id);

  if (!ObjectId.isValid(idAsString)) {
    throw new Error('Invalid Mandatory Criteria Id');
  }

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.GEF_MANDATORY_CRITERIA_VERSIONED);
  collection.findOne({ _id: { $eq: ObjectId(idAsString) } }, (error, result) => {
    assert.equal(error, null);
    callback(result);
  });
};

/**
 * Creates a new mandatory criteria version.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<Express.Response>} - Returns the ID of the inserted mandatory criteria on success, or an error message on failure.
 */
exports.create = async (req, res) => {
  if (!isVerifiedPayload({ payload: req.body, template: PAYLOAD_VERIFICATION.CRITERIA.MANDATORY.VERSIONED })) {
    console.error('Invalid GEF mandatory criteria payload supplied %o', req.body);
    return res.status(HttpStatusCode.BadRequest).send({ status: HttpStatusCode.BadRequest, message: 'Invalid GEF mandatory criteria payload' });
  }

  if (isProduction()) {
    return res.status(HttpStatusCode.Unauthorized).send({ status: HttpStatusCode.Unauthorized, message: 'Unauthorised insertion' });
  }

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.GEF_MANDATORY_CRITERIA_VERSIONED);
  const auditDetails = generatePortalAuditDetails(req.user._id);

  // MC insertion on non-production environments
  const criteria = { ...req.body, auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails) };
  const { insertedId } = await collection.insertOne(new MandatoryCriteria(criteria));

  return res.status(HttpStatusCode.Created).send({ _id: insertedId });
};

/**
 * Retrieves all mandatory criteria and sends them in a response.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.findAll = (req, res) =>
  findMandatoryCriteria((mandatoryCriteria) =>
    sortMandatoryCriteria(mandatoryCriteria, (sortedMandatoryCriteria) =>
      res.status(200).send({
        items: sortedMandatoryCriteria,
      }),
    ),
  );

/**
 * Retrieves a specific mandatory criteria by ID and sends it in a response.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.findOne = (req, res) => findOneMandatoryCriteria(req.params.id, (mandatoryCriteria) => res.status(200).send(mandatoryCriteria));

/**
 * Retrieves the latest mandatory criteria and sends it in a response.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.findLatest = async (req, res) => {
  const criteria = await api.findLatestGefMandatoryCriteria();
  if (criteria.status === 200) {
    return res.status(200).send(criteria.data);
  }
  return res.status(criteria.status).send();
};

/**
 * Deletes a mandatory criteria version.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<Express.Response>} - Returns the result of the deletion operation on success, or an error message on failure.
 * @throws {Error} - If the provided ID is invalid or the document cannot be deleted.
 */
exports.delete = async (req, res) => {
  const auditDetails = generatePortalAuditDetails(req.user._id);
  const criteriaId = req.params.id;

  if (!ObjectId.isValid(String(criteriaId))) {
    return res.status(400).send({ status: 400, message: 'Invalid Mandatory Criteria Id' });
  }

  try {
    const deleteResult = await deleteOne({
      documentId: ObjectId(String(criteriaId)),
      collectionName: MONGO_DB_COLLECTIONS.GEF_MANDATORY_CRITERIA_VERSIONED,
      db,
      auditDetails,
    });

    return res.status(200).send(deleteResult);
  } catch (error) {
    if (error instanceof DocumentNotDeletedError) {
      return res.sendStatus(404);
    }
    console.error(error);
    return res.status(500).send({ status: 500, error });
  }
};
