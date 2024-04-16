"use strict";
const tslib_1 = require("tslib");
const DEFAULTS = require('../defaults');
const db = require('../../drivers/db-client');
const { isValidMongoId } = require('../validation/validateIds');
const { userHasAccessTo } = require('../users/checks');
const validate = require('../validation/completeDealValidation');
const calculateStatuses = require('../section-status/calculateStatuses');
const calculateDealSummary = require('../deal-summary');
const { getLatestEligibilityCriteria } = require('./eligibilityCriteria.controller');
const { escapeOperators } = require('../helpers/escapeOperators');
const api = require('../api');
const computeSkipPosition = require('../helpers/computeSkipPosition');
/**
 * Find a deal (BSS, EWCS only)
 */
const findOneDeal = (_id, callback) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const deal = yield api.findOneDeal(_id);
    if (callback) {
        callback(deal);
    }
    return deal;
});
exports.findOneDeal = findOneDeal;
const createDealEligibility = (eligibility) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (eligibility) {
        const beingGivenEligibility = eligibility && eligibility.criteria;
        if (beingGivenEligibility) {
            const eligibilityObj = Object.assign(Object.assign({}, eligibility), { lastUpdated: null });
            if (eligibility.status) {
                eligibilityObj.status = eligibility.status;
            }
            else {
                eligibilityObj.status = DEFAULTS.DEAL.eligibility.status;
            }
            return eligibilityObj;
        }
    }
    const latestEligibility = yield getLatestEligibilityCriteria();
    return Object.assign(Object.assign({}, latestEligibility), { status: DEFAULTS.DEAL.eligibility.status });
});
exports.createDealEligibility = createDealEligibility;
/**
 * Create default deal data (BSS, EWCS only)
 */
const createNewDealData = (deal, maker) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const newDeal = Object.assign(Object.assign(Object.assign({}, DEFAULTS.DEAL), deal), { bank: maker.bank, maker, details: Object.assign(Object.assign({}, DEFAULTS.DEAL.details), deal.details), eligibility: yield createDealEligibility(deal.eligibility) });
    return newDeal;
});
/**
 * Create a deal (BSS, EWCS only)
 */
const createDeal = (dealBody, user) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const deal = yield createNewDealData(dealBody, user);
    return api.createDeal(deal, user);
});
exports.createDeal = createDeal;
exports.create = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { status, data } = yield createDeal(req.body, req.user);
    return res.status(status).send(data);
});
/**
 * Find a deal (BSS, EWCS only)
 */
exports.findOne = (req, res) => {
    var _a;
    if (!isValidMongoId((_a = req === null || req === void 0 ? void 0 : req.params) === null || _a === void 0 ? void 0 : _a.id)) {
        console.error('Find one deal API failed for deal id %s', req.params.id);
        return res.status(400).send({ status: 400, message: 'Invalid id provided' });
    }
    return findOneDeal(req.params.id, (deal) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (!deal) {
            res.status(404).send();
        }
        else if (!userHasAccessTo(req.user, deal)) {
            res.status(401).send();
        }
        else {
            // apply realtime validation so we catch any time-dependent fields
            //  that have -become- invalid..
            const validationErrors = yield validate(deal);
            const dealWithStatuses = calculateStatuses(deal, validationErrors);
            const dealWithSummary = Object.assign(Object.assign({}, dealWithStatuses), { summary: calculateDealSummary(deal) });
            res.status(200).send({
                deal: dealWithSummary,
                validationErrors,
            });
        }
    }));
};
const updateDeal = (dealId, dealUpdate, user) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const updatedDeal = yield api.updateDeal(dealId, dealUpdate, user);
    return updatedDeal;
});
exports.updateDeal = updateDeal;
/**
 * Update a deal (BSS, EWCS only)
 */
exports.update = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const dealId = req.params.id;
    yield findOneDeal(dealId, (deal) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (!deal)
            res.status(404).send();
        if (!userHasAccessTo(req.user, deal)) {
            return res.status(401).send();
        }
        const updatedDeal = yield updateDeal(dealId, req.body, req.user, deal);
        return res.status(200).json(updatedDeal);
    }));
});
/**
 * Delete a deal (BSS, EWCS only)
 */
exports.delete = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const dealId = req.params.id;
    yield findOneDeal(dealId, (deal) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (!deal)
            res.status(404).send();
        if (!userHasAccessTo(req.user, deal)) {
            res.status(401).send();
        }
        else {
            const response = yield api.deleteDeal(dealId);
            res.status(response.status).send(response.body);
        }
    }));
});
/**
 * Query all deals in the deals collection (BSS, EWCS, GEF)
 * @param {*} filters any filters for list, uses match spec
 * @param {*} sort any additional sort fields for list
 * @param {*} start where list should start - part of pagination.
 * @param {*} pagesize Size of each page - limits list results
 * @returns combined and formatted list of deals
 */
const queryAllDeals = (...args_1) => tslib_1.__awaiter(void 0, [...args_1], void 0, function* (filters = {}, sort = {}, start = 0, pagesize = 0) {
    const startPage = computeSkipPosition(start, filters, sort);
    const collection = yield db.getCollection('deals');
    const results = yield collection
        .aggregate([
        { $match: escapeOperators(filters) },
        {
            $project: {
                _id: true,
                bankInternalRefName: '$bankInternalRefName',
                status: '$status',
                product: '$dealType',
                submissionType: '$submissionType',
                exporter: '$exporter.companyName',
                // exporter in lowercase for sorting
                lowerExporter: { $toLower: '$exporter.companyName' },
                updatedAt: { $toDouble: '$updatedAt' },
            },
        },
        {
            $sort: Object.assign(Object.assign({}, sort), { updatedAt: -1 }),
        },
        {
            $facet: {
                count: [{ $count: 'total' }],
                deals: [
                    { $skip: startPage },
                    ...(pagesize ? [{ $limit: pagesize }] : []),
                ],
            },
        },
        { $unwind: '$count' },
        {
            $project: {
                count: '$count.total',
                deals: true,
            },
        },
    ])
        .toArray();
    if (results.length) {
        const { count, deals } = results[0];
        return {
            count,
            deals,
        };
    }
    return {
        deals: [],
        count: 0,
    };
});
exports.getQueryAllDeals = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { start, pagesize, filters, sort } = req.body;
    const results = yield queryAllDeals(filters, sort, start, pagesize);
    return res.status(200).send(results);
});
