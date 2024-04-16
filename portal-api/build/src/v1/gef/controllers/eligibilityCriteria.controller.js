"use strict";
const tslib_1 = require("tslib");
const { EligibilityCriteria } = require('../models/eligibilityCriteria');
const db = require('../../../drivers/db-client');
const utils = require('../utils.service');
const { PAYLOAD, DEAL } = require('../../../constants');
const payloadVerification = require('../../helpers/payload');
const sortByVersion = (arr, callback) => {
    const sortedArray = arr.sort((a, b) => Number(a.version) - Number(b.version));
    return callback(sortedArray);
};
exports.getAll = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const collection = yield db.getCollection('eligibilityCriteria');
    const items = yield collection.find({ product: DEAL.DEAL_TYPE.GEF }).toArray();
    sortByVersion(items, (sortedMandatoryCriteria) => {
        res.status(200).send({
            items: sortedMandatoryCriteria,
        });
    });
});
exports.getByVersion = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { version } = req.params;
    if (typeof version !== 'string') {
        return res.status(400).send({ status: 400, message: 'Invalid Version' });
    }
    const collection = yield db.getCollection('eligibilityCriteria');
    const item = yield collection.findOne({ $and: [{ version: { $eq: Number(version) } }, { product: { $eq: DEAL.DEAL_TYPE.GEF } }] });
    return item ? res.status(200).send(item) : res.status(404).send();
});
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
        .find({ $and: [{ isInDraft: { $eq: false } }, { product: { $eq: DEAL.DEAL_TYPE.GEF } }] })
        .sort({ version: -1 })
        .limit(1)
        .toArray();
    return latestEligibilityCriteria;
});
exports.getLatestEligibilityCriteria = getLatestEligibilityCriteria;
exports.getLatest = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const doc = yield getLatestEligibilityCriteria();
    res.status(200).send(doc);
});
exports.create = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const collection = yield db.getCollection('eligibilityCriteria');
    const criteria = req === null || req === void 0 ? void 0 : req.body;
    if (payloadVerification(criteria, PAYLOAD.CRITERIA.ELIGIBILITY)) {
        const result = yield collection.insertOne(new EligibilityCriteria(criteria));
        return res.status(201).send({ _id: result.insertedId });
    }
    return res.status(400).send({ status: 400, message: 'Invalid GEF eligibility criteria payload' });
});
exports.delete = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const collection = yield db.getCollection('eligibilityCriteria');
    const response = yield collection.findOneAndDelete({ version: { $eq: Number(req.params.version) } });
    res.status(utils.mongoStatus(response)).send(response.value ? response.value : null);
});
