"use strict";
const tslib_1 = require("tslib");
const assert = require('assert');
const db = require('../../drivers/db-client');
const { PAYLOAD } = require('../../constants');
const payloadVerification = require('../helpers/payload');
const sortMandatoryCriteria = (arr, callback) => {
    const sortedArray = arr.sort((a, b) => Number(a.id) - Number(b.id));
    return callback(sortedArray);
};
const findMandatoryCriteria = (callback) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const collection = yield db.getCollection('mandatoryCriteria');
    collection.find().toArray((error, result) => {
        assert.equal(error, null);
        callback(result);
    });
});
exports.findMandatoryCriteria = findMandatoryCriteria;
const findOneMandatoryCriteria = (version, callback) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (typeof version !== 'string' || Number.isNaN(version)) {
        throw new Error('Invalid Version');
    }
    const versionAsNumber = Number(version);
    const collection = yield db.getCollection('mandatoryCriteria');
    collection.findOne({ version: { $eq: versionAsNumber } }, (error, result) => {
        assert.equal(error, null);
        callback(result);
    });
});
exports.create = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const criteria = req === null || req === void 0 ? void 0 : req.body;
    if (payloadVerification(criteria, PAYLOAD.CRITERIA.MANDATORY.DEFAULT)) {
        // MC insertion on non-production environments
        if (process.env.NODE_ENV !== 'production') {
            const collection = yield db.getCollection('mandatoryCriteria');
            const result = yield collection.insertOne(criteria);
            return res.status(200).send(result);
        }
        return res.status(400).send({ status: 404, message: 'Unauthorised insertion' });
    }
    return res.status(400).send({ status: 400, message: 'Invalid mandatory criteria payload' });
});
exports.findAll = (req, res) => (findMandatoryCriteria((mandatoryCriteria) => sortMandatoryCriteria(mandatoryCriteria, (sortedMandatoryCriteria) => res.status(200).send({
    count: mandatoryCriteria.length,
    mandatoryCriteria: sortedMandatoryCriteria,
}))));
exports.findOne = (req, res) => (findOneMandatoryCriteria(req.params.version, (mandatoryCriteria) => res.status(200).send(mandatoryCriteria)));
const findLatestMandatoryCriteria = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const collection = yield db.getCollection('mandatoryCriteria');
    const latest = yield collection.find().sort({ version: -1 }).limit(1).toArray();
    return latest[0];
});
exports.findLatestMandatoryCriteria = findLatestMandatoryCriteria;
exports.findLatest = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const latest = yield findLatestMandatoryCriteria();
    return res.status(200).send(latest);
});
exports.update = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (typeof req.params.version !== 'string') {
        res.status(400).send({ status: 400, message: 'Invalid Version' });
    }
    // MC insertion on non-production environments
    if (process.env.NODE_ENV !== 'production') {
        const collection = yield db.getCollection('mandatoryCriteria');
        const status = yield collection.updateOne({ version: { $eq: Number(req.params.version) } }, { $set: { criteria: req.body.criteria } }, {});
        return res.status(200).send(status);
    }
    return res.status(400).send();
});
exports.delete = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const collection = yield db.getCollection('mandatoryCriteria');
    const { version } = req.params;
    const versionNumber = Number(version);
    if (!Number.isNaN(versionNumber)) {
        const status = yield collection.deleteOne({ version: { $eq: versionNumber } });
        return res.status(200).send(status);
    }
    return res.status(400).send({ status: 400, message: 'Invalid mandatory criteria version number' });
});
