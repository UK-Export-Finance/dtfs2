"use strict";
const tslib_1 = require("tslib");
const assert = require('assert');
const { ObjectId } = require('mongodb');
const { hasValidObjectId } = require('../validation/validateObjectId');
const { PAYLOAD } = require('../../constants');
const payloadVerification = require('../helpers/payload');
const db = require('../../drivers/db-client');
const findBanks = (callback) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const collection = yield db.getCollection('banks');
    collection.find().toArray((error, result) => {
        assert.equal(error, null);
        callback(result);
    });
});
const findOneBank = (id, callback) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (typeof id !== 'string') {
        throw new Error('Invalid Bank Id');
    }
    const collection = yield db.getCollection('banks');
    if (!callback) {
        return collection.findOne({ id: { $eq: id } });
    }
    return collection.findOne({ id: { $eq: id } }, (error, result) => {
        assert.equal(error, null);
        callback(result);
    });
});
exports.findOneBank = findOneBank;
exports.create = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const bank = req === null || req === void 0 ? void 0 : req.body;
    if (payloadVerification(bank, PAYLOAD.BANK)) {
        const collection = yield db.getCollection('banks');
        const result = yield collection.insertOne(bank);
        return res.status(200).json(result);
    }
    return res.status(400).send({ status: 400, message: 'Invalid bank payload' });
});
exports.findAll = (req, res) => (findBanks((banks) => res.status(200).send({
    count: banks.length,
    banks,
})));
exports.findOne = (req, res) => (findOneBank(req.params.id, (deal) => res.status(200).send(deal)));
exports.update = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (typeof id !== 'string') {
        return res.status(400).send({ status: 400, message: 'Invalid Bank Id' });
    }
    const collection = yield db.getCollection('banks');
    const updatedBank = yield collection.updateOne({ id: { $eq: id } }, { $set: req.body }, {});
    return res.status(200).json(updatedBank);
});
exports.delete = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const collection = yield db.getCollection('banks');
    const { id } = req.params;
    if (typeof id === 'string') {
        const status = yield collection.deleteOne({ id: { $eq: id } });
        return res.status(200).send(status);
    }
    return res.status(400).send({ status: 400, message: 'Invalid bank id' });
});
// validate the user's bank against the deal
exports.validateBank = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { dealId, bankId } = req.body;
    // check if the `dealId` is a valid ObjectId
    if (hasValidObjectId(dealId) && typeof bankId === 'string') {
        const collection = yield db.getCollection('deals');
        // validate the bank against the deal
        const isValid = yield collection.findOne({ _id: { $eq: ObjectId(dealId) }, 'bank.id': { $eq: bankId } });
        if (isValid) {
            return res.status(200).send({ status: 200, isValid: true });
        }
        return res.status(404).send({ status: 404, isValid: false });
    }
    return res.status(400).send({ status: 400, isValid: false });
});
