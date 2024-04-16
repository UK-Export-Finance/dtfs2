"use strict";
const tslib_1 = require("tslib");
const assert = require('assert');
const db = require('../../drivers/db-client');
const { PAYLOAD, DEAL } = require('../../constants');
const payloadVerification = require('../helpers/payload');
const sortEligibilityCriteria = (arr, callback) => {
    const sortedArray = arr.sort((a, b) => Number(a.id) - Number(b.id));
    return callback(sortedArray);
};
const findEligibilityCriteria = (callback) => new Promise((resolve) => {
    db.getCollection('eligibilityCriteria').then((collection) => {
        collection.find({ product: { $eq: DEAL.DEAL_TYPE.BSS_EWCS } }).toArray((error, result) => {
            assert.equal(error, null);
            resolve(result);
            if (callback)
                callback(result);
        });
    });
});
exports.findEligibilityCriteria = findEligibilityCriteria;
const findOneEligibilityCriteria = (version, callback) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (typeof version !== 'number') {
        throw new Error('Invalid Version');
    }
    const collection = yield db.getCollection('eligibilityCriteria');
    collection.findOne({ $and: [{ version: { $eq: Number(version) } }, { product: DEAL.DEAL_TYPE.BSS_EWCS }] }, (error, result) => {
        assert.equal(error, null);
        callback(result);
    });
});
exports.create = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const criteria = req === null || req === void 0 ? void 0 : req.body;
    if (payloadVerification(criteria, PAYLOAD.CRITERIA.ELIGIBILITY)) {
        const collection = yield db.getCollection('eligibilityCriteria');
        const eligibilityCriteria = yield collection.insertOne(criteria);
        return res.status(200).send(eligibilityCriteria);
    }
    return res.status(400).send({ status: 400, message: 'Invalid eligibility criteria payload' });
});
exports.findAll = (req, res) => findEligibilityCriteria((eligibilityCriteria) => sortEligibilityCriteria(eligibilityCriteria, (sortedEligibilityCriteria) => res.status(200).send({
    count: eligibilityCriteria.length,
    eligibilityCriteria: sortedEligibilityCriteria,
})));
exports.findOne = (req, res) => findOneEligibilityCriteria(Number(req.params.version), (eligibilityCriteria) => res.status(200).send(eligibilityCriteria));
/**
 * Finds the latest (highest version number whose `isInDraft` is set to false) eligibility
 * criteria document from the 'eligibilityCriteria' collection.
 * EC is returned as an array for mapping.
 *
 * @returns {Object} The latest eligibility criteria document.
 */
const getLatestEligibilityCriteria = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const collection = yield db.getCollection('eligibilityCriteria');
    const [latestEligibilityCriteria] = yield collection
        .find({ $and: [{ product: { $eq: DEAL.DEAL_TYPE.BSS_EWCS } }, { isInDraft: { $eq: false } }] })
        .sort({ version: -1 })
        .limit(1)
        .toArray();
    return latestEligibilityCriteria;
});
exports.getLatestEligibilityCriteria = getLatestEligibilityCriteria;
exports.findLatestGET = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const latest = yield getLatestEligibilityCriteria();
    return res.status(200).send(latest);
});
exports.update = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (typeof req.params.version !== 'string') {
        return res.status(400).send({ status: 400, message: 'Invalid Version' });
    }
    const collection = yield db.getCollection('eligibilityCriteria');
    const status = yield collection.updateOne({ version: { $eq: Number(req.params.version) } }, { $set: { criteria: req.body.criteria } }, {});
    return res.status(200).send(status);
});
exports.delete = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const collection = yield db.getCollection('eligibilityCriteria');
    const { version } = req.params;
    const versionNumber = Number(version);
    if (!Number.isNaN(versionNumber)) {
        const status = yield collection.deleteOne({ version: { $eq: versionNumber } });
        return res.status(200).send(status);
    }
    return res.status(400).send({ status: 400, message: 'Invalid eligibility criteria version number' });
});
