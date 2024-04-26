const assert = require('assert');
const { ObjectId } = require('mongodb');
const { generatePortalUserAuditDatabaseRecord, generateAuditDatabaseRecordFromAuditDetails } = require('@ukef/dtfs2-common/src/helpers/change-stream/generate-audit-database-record');
const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/src/helpers/change-stream/generate-audit-details');
const { hasValidObjectId } = require('../validation/validateObjectId');
const { PAYLOAD } = require('../../constants');
const payloadVerification = require('../helpers/payload');

const db = require('../../drivers/db-client');

const findBanks = async (callback) => {
  const collection = await db.getCollection('banks');

  collection.find().toArray((error, result) => {
    assert.equal(error, null);
    callback(result);
  });
};

const findOneBank = async (id, callback) => {
  if (typeof id !== 'string') {
    throw new Error('Invalid Bank Id');
  }

  const collection = await db.getCollection('banks');

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

  if (!payloadVerification(bank, PAYLOAD.BANK)) {
    return res.status(400).send({ status: 400, message: 'Invalid bank payload' });
  }

  const auditDetails = generatePortalAuditDetails(req.user._id);

  const collection = await db.getCollection('banks');
  const result = await collection.insertOne({
    ...bank,
    auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
  });

  return res.status(200).json(result);
};

exports.findAll = (req, res) => (
  findBanks((banks) => res.status(200).send({
    count: banks.length,
    banks,
  }))
);

exports.findOne = (req, res) => (
  findOneBank(req.params.id, (deal) => res.status(200).send(deal))
);

exports.update = async (req, res) => {
  const { id } = req.params;

  if (typeof id !== 'string') {
    return res.status(400).send({ status: 400, message: 'Invalid Bank Id' });
  }

  const collection = await db.getCollection('banks');
  const update = { ... req.body, auditRecord: generatePortalUserAuditDatabaseRecord(req.user._id) }
  const updatedBank = await collection.updateOne({ id: { $eq: id } }, { $set: update }, {});

  return res.status(200).json(updatedBank);
};

exports.delete = async (req, res) => {
  const collection = await db.getCollection('banks');
  const { id } = req.params;

  if (typeof id === 'string') {
    const status = await collection.deleteOne({ id: { $eq: id } });
    return res.status(200).send(status);
  }

  return res.status(400).send({ status: 400, message: 'Invalid bank id' });
};

// validate the user's bank against the deal
exports.validateBank = async (req, res) => {
  const { dealId, bankId } = req.body;

  // check if the `dealId` is a valid ObjectId
  if (hasValidObjectId(dealId) && typeof bankId === 'string') {
    const collection = await db.getCollection('deals');

    // validate the bank against the deal
    const isValid = await collection.findOne({ _id: { $eq: ObjectId(dealId) }, 'bank.id': { $eq: bankId } });

    if (isValid) {
      return res.status(200).send({ status: 200, isValid: true });
    }
    return res.status(404).send({ status: 404, isValid: false });
  }
  return res.status(400).send({ status: 400, isValid: false });
};
