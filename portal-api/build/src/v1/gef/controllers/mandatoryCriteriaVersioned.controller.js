"use strict";
const tslib_1 = require("tslib");
const assert = require('assert');
const { ObjectId } = require('mongodb');
const { MandatoryCriteria } = require('../models/mandatoryCriteria');
const db = require('../../../drivers/db-client');
const utils = require('../utils.service');
const api = require('../../api');
const { PAYLOAD } = require('../../../constants');
const payloadVerification = require('../../helpers/payload');
const collectionName = 'gef-mandatoryCriteriaVersioned';
const sortMandatoryCriteria = (arr, callback) => {
    const sortedArray = arr.sort((a, b) => Number(a.version) - Number(b.version));
    return callback(sortedArray);
};
const findMandatoryCriteria = (callback) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const collection = yield db.getCollection(collectionName);
    collection.find().toArray((error, result) => {
        assert.equal(error, null);
        callback(result);
    });
});
exports.findMandatoryCriteria = findMandatoryCriteria;
const findOneMandatoryCriteria = (id, callback) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const idAsString = String(id);
    if (!ObjectId.isValid(idAsString)) {
        throw new Error('Invalid Mandatory Criteria Id');
    }
    const collection = yield db.getCollection(collectionName);
    collection.findOne({ _id: { $eq: ObjectId(idAsString) } }, (error, result) => {
        assert.equal(error, null);
        callback(result);
    });
});
exports.create = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const collection = yield db.getCollection(collectionName);
    const criteria = req === null || req === void 0 ? void 0 : req.body;
    if (payloadVerification(criteria, PAYLOAD.CRITERIA.MANDATORY.VERSIONED)) {
        const mandatoryCriteria = yield collection.insertOne(new MandatoryCriteria(criteria));
        return res.status(201).send({ _id: mandatoryCriteria.insertedId });
    }
    return res.status(400).send({ status: 400, message: 'Invalid GEF mandatory criteria payload' });
});
exports.findAll = (req, res) => (findMandatoryCriteria((mandatoryCriteria) => sortMandatoryCriteria(mandatoryCriteria, (sortedMandatoryCriteria) => res.status(200).send({
    items: sortedMandatoryCriteria,
}))));
exports.findOne = (req, res) => (findOneMandatoryCriteria(req.params.id, (mandatoryCriteria) => res.status(200).send(mandatoryCriteria)));
exports.findLatest = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const criteria = yield api.findLatestGefMandatoryCriteria();
    if (criteria.status === 200) {
        return res.status(200).send(criteria.data);
    }
    return res.status(criteria.status).send();
});
exports.update = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
        return res.status(400).send({ status: 400, message: 'Invalid Id' });
    }
    const collection = yield db.getCollection(collectionName);
    const update = req.body;
    update.updatedAt = Date.now();
    const response = yield collection.findOneAndUpdate({ _id: { $eq: ObjectId(id) } }, { $set: update }, { returnNewDocument: true, returnDocument: 'after' });
    return res.status(utils.mongoStatus(response)).send(response.value ? response.value : null);
});
exports.delete = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!ObjectId.isValid(String(req.params.id))) {
        return res.status(400).send({ status: 400, message: 'Invalid Mandatory Criteria Id' });
    }
    const collection = yield db.getCollection(collectionName);
    const response = yield collection.findOneAndDelete({ _id: { $eq: ObjectId(String(req.params.id)) } });
    return res.status(utils.mongoStatus(response)).send(response.value ? response.value : null);
});
