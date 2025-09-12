const { PAYLOAD_VERIFICATION, MONGO_DB_COLLECTIONS, DocumentNotDeletedError } = require('@ukef/dtfs2-common');
const { isVerifiedPayload } = require('@ukef/dtfs2-common/payload-verification');
const assert = require('assert');
const { ObjectId } = require('mongodb');
const { generateAuditDatabaseRecordFromAuditDetails, generatePortalAuditDetails, deleteOne } = require('@ukef/dtfs2-common/change-stream');
const { hasValidObjectId } = require('../validation/validateObjectId');

const { mongoDbClient: db } = require('../../drivers/db-client');

const findBanks = async (callback) => {
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.BANKS);

  collection.find().toArray((error, result) => {
    assert.equal(error, null);
    callback(result);
  });
};

const findOneBank = async (id, callback) => {
  if (typeof id !== 'string') {
    throw new Error('Invalid Bank Id');
  }

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.BANKS);

  if (!callback) {
    return collection.findOne({ id: { $eq: id } });
  }

  return collection.findOne({ id: { $eq: id } }, (error, result) => {
    assert.equal(error, null);
    callback(result);
  });
};
exports.findOneBank = findOneBank;

exports.create = async (req, res) => {
  const bank = req?.body;

  if (!isVerifiedPayload({ payload: bank, template: PAYLOAD_VERIFICATION.BANK })) {
    return res.status(400).send({ status: 400, message: 'Invalid bank payload' });
  }

  const auditDetails = generatePortalAuditDetails(req.user._id);

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.BANKS);
  const result = await collection.insertOne({
    ...bank,
    auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
  });

  return res.status(200).json(result);
};

exports.findAll = (req, res) =>
  findBanks((banks) =>
    res.status(200).send({
      count: banks.length,
      banks,
    }),
  );

exports.findOne = (req, res) => findOneBank(req.params.id, (deal) => res.status(200).send(deal));

exports.update = async (req, res) => {
  const { id } = req.params;

  if (typeof id !== 'string') {
    return res.status(400).send({ status: 400, message: 'Invalid Bank Id' });
  }

  const auditDetails = generatePortalAuditDetails(req.user._id);

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.BANKS);
  const update = { ...req.body, auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails) };
  const updatedBank = await collection.updateOne({ id: { $eq: id } }, { $set: update }, {});

  return res.status(200).json(updatedBank);
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  const auditDetails = generatePortalAuditDetails(req.user._id);

  if (typeof id !== 'string') {
    return res.status(400).send({ status: 400, message: 'Invalid bank id' });
  }

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.BANKS);
  const bank = await collection.findOne({ id: { $eq: id } });

  if (!bank) {
    return res.status(404).send({ status: 404, message: 'Bank not found' });
  }

  try {
    const deleteResult = await deleteOne({
      documentId: new ObjectId(bank._id),
      collectionName: MONGO_DB_COLLECTIONS.BANKS,
      db,
      auditDetails,
    });
    return res.status(200).send(deleteResult);
  } catch (error) {
    if (error instanceof DocumentNotDeletedError) {
      return res.status(404).send({ status: 404, message: 'Bank not found' });
    }
    console.error('Error deleting bank %o', error);
    return res.status(500).send({ status: 500, error });
  }
};

// validate the user's bank against the deal
exports.validateBank = async (req, res) => {
  const { dealId, bankId } = req.body;

  // check if the `dealId` is a valid ObjectId
  if (hasValidObjectId(dealId) && typeof bankId === 'string') {
    const collection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);

    // validate the bank against the deal
    const isValid = await collection.findOne({ _id: { $eq: ObjectId(dealId) }, 'bank.id': { $eq: bankId } });

    if (isValid) {
      return res.status(200).send({ status: 200, isValid: true });
    }
    return res.status(404).send({ status: 404, isValid: false });
  }
  return res.status(400).send({ status: 400, isValid: false });
};
