"use strict";
const tslib_1 = require("tslib");
const db = require('../../drivers/db-client');
const api = require('../api');
const { escapeOperators } = require('../helpers/escapeOperators');
const computeSkipPosition = require('../helpers/computeSkipPosition');
const { updateDeal } = require('./deal.controller');
/**
 * Create a facility (BSS, EWCS only)
 */
exports.create = (facilityBody, user) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const createdFacility = yield api.createFacility(facilityBody, user);
    const { status, data } = createdFacility;
    const { _id } = data;
    const facility = yield api.findOneFacility(_id);
    return {
        status,
        data: facility,
    };
});
/**
 * Find a facility (BSS, EWCS only)
 */
exports.findOne = (facilityId) => tslib_1.__awaiter(void 0, void 0, void 0, function* () { return api.findOneFacility(facilityId); });
exports.update = (dealId, facilityId, facilityBody, user) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const updatedFacility = yield api.updateFacility(facilityId, facilityBody, user);
    if (updatedFacility) {
        // update facilitiesUpdated timestamp in the deal
        const dealUpdate = {
            facilitiesUpdated: new Date().valueOf(),
        };
        yield updateDeal(dealId, dealUpdate, user);
    }
    return updatedFacility;
});
/**
 * Delete a facility (BSS, EWCS only)
 */
exports.delete = (facilityId, user) => tslib_1.__awaiter(void 0, void 0, void 0, function* () { return api.deleteFacility(facilityId, user); });
/**
 * Create multiple facilities (BSS, EWCS only)
 */
exports.createMultiple = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { facilities, dealId, user } = req.body;
    const { data: ids } = yield api.createMultipleFacilities(facilities, dealId, user);
    const allFacilities = yield Promise.all(ids.map((id) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const facility = yield api.findOneFacility(id);
        return facility;
    })));
    return res.status(200).send(allFacilities);
});
/**
 * Create multiple facilities (BSS, EWCS only)
 */
exports.createMultipleFacilities = (facilities, dealId, user) => tslib_1.__awaiter(void 0, void 0, void 0, function* () { return api.createMultipleFacilities(facilities, dealId, user); });
/**
 * Queries all facilities in the facilities collection (BSS, EWCS, GEF)
 * @param {*} filters any filters for deals or facilities, uses match spec
 * @param {*} sort any additional sort fields for list
 * @param {*} start where list should start - part of pagination.
 * @param {*} pagesize Size of each page - limits list results
 * @returns combined and formatted list of facilities
 */
const queryAllFacilities = (...args_1) => tslib_1.__awaiter(void 0, [...args_1], void 0, function* (filters = {}, sort = {}, start = 0, pagesize = 0) {
    const startPage = computeSkipPosition(start, filters, sort);
    const collection = yield db.getCollection('facilities');
    const results = yield collection
        .aggregate([
        {
            $lookup: {
                from: 'deals',
                localField: 'dealId',
                foreignField: '_id',
                as: 'deal',
            },
        },
        { $unwind: '$deal' },
        { $match: escapeOperators(filters) },
        {
            $project: {
                _id: true,
                dealId: '$deal._id',
                submissionType: '$deal.submissionType',
                name: '$name',
                ukefFacilityId: '$ukefFacilityId',
                currency: '$currency',
                value: '$value',
                type: '$type',
                hasBeenIssued: '$hasBeenIssued',
                submittedAsIssuedDate: '$submittedAsIssuedDate',
                updatedAt: { $toDouble: '$updatedAt' },
                exporter: '$deal.exporter.companyName',
                // exporter in lowercase for sorting
                lowerExporter: { $toLower: '$deal.exporter.companyName' },
            },
        },
        {
            $sort: Object.assign(Object.assign({}, sort), { updatedAt: -1 }),
        },
        {
            $facet: {
                count: [{ $count: 'total' }],
                facilities: [
                    { $skip: startPage },
                    ...(pagesize ? [{ $limit: pagesize }] : []),
                ],
            },
        },
        { $unwind: '$count' },
        {
            $project: {
                count: '$count.total',
                facilities: true,
            },
        },
    ])
        .toArray();
    if (results.length) {
        const { count, facilities } = results[0];
        return {
            count,
            facilities,
        };
    }
    return {
        facilities: [],
        count: 0,
    };
});
exports.getQueryAllFacilities = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { start, pagesize, filters, sort } = req.body;
    const results = yield queryAllFacilities(filters, sort, start, pagesize);
    return res.status(200).send(results);
});
