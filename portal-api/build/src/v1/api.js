"use strict";
const tslib_1 = require("tslib");
const axios = require('axios');
const { isValidMongoId, isValidBankId, isValidReportPeriod } = require('./validation/validateIds');
require('dotenv').config();
const { DTFS_CENTRAL_API_URL, DTFS_CENTRAL_API_KEY, TFM_API_URL, TFM_API_KEY } = process.env;
const headers = {
    central: {
        'Content-Type': 'application/json',
        'x-api-key': DTFS_CENTRAL_API_KEY,
    },
    tfm: {
        'Content-Type': 'application/json',
        'x-api-key': TFM_API_KEY,
    },
};
const findOneDeal = (dealId) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!isValidMongoId(dealId)) {
            console.error('Find one deal API failed for deal id %s', dealId);
            return false;
        }
        const response = yield axios({
            method: 'get',
            url: `${DTFS_CENTRAL_API_URL}/v1/portal/deals/${dealId}`,
            headers: headers.central,
        });
        return response.data.deal;
    }
    catch (error) {
        console.error('Unable to find one deal %o', error);
        return false;
    }
});
const createDeal = (deal, user) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield axios({
            method: 'post',
            url: `${DTFS_CENTRAL_API_URL}/v1/portal/deals`,
            headers: headers.central,
            data: {
                deal,
                user,
            },
        });
    }
    catch ({ response }) {
        return response;
    }
});
const updateDeal = (dealId, dealUpdate, user) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!isValidMongoId(dealId)) {
            console.error('Update deal API failed for deal id %s', dealId);
            return false;
        }
        const response = yield axios({
            method: 'put',
            url: `${DTFS_CENTRAL_API_URL}/v1/portal/deals/${dealId}`,
            headers: headers.central,
            data: {
                dealUpdate,
                user,
            },
        });
        return response.data;
    }
    catch (error) {
        console.error('Unable to update deal %o', error);
        return false;
    }
});
const deleteDeal = (dealId) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!isValidMongoId(dealId)) {
            console.error('Delete deal API failed for deal id %s', dealId);
            return false;
        }
        return yield axios({
            method: 'delete',
            url: `${DTFS_CENTRAL_API_URL}/v1/portal/deals/${dealId}`,
            headers: headers.central,
        });
    }
    catch (error) {
        console.error('Unable to delete deal %o', error);
        return { status: (error === null || error === void 0 ? void 0 : error.code) || 500, data: 'Error when deleting deal' };
    }
});
const addDealComment = (dealId, commentType, comment) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!isValidMongoId(dealId)) {
            console.error('Add deal comment API failed for deal id %s', dealId);
            return false;
        }
        const response = yield axios({
            method: 'post',
            url: `${DTFS_CENTRAL_API_URL}/v1/portal/deals/${dealId}/comment`,
            headers: headers.central,
            data: {
                commentType,
                comment,
            },
        });
        return response.data;
    }
    catch (error) {
        console.error('Unable to add deal comment %o', error);
        return false;
    }
});
const createFacility = (facility, user) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield axios({
            method: 'post',
            url: `${DTFS_CENTRAL_API_URL}/v1/portal/facilities`,
            headers: headers.central,
            data: {
                facility,
                user,
            },
        });
    }
    catch ({ response }) {
        return response;
    }
});
const createMultipleFacilities = (facilities, dealId, user) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield axios({
            method: 'post',
            url: `${DTFS_CENTRAL_API_URL}/v1/portal/multiple-facilities`,
            headers: headers.central,
            data: {
                facilities,
                dealId,
                user,
            },
        });
    }
    catch ({ response }) {
        return response;
    }
});
const findOneFacility = (facilityId) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!isValidMongoId(facilityId)) {
            console.error('Find one facility API failed for facility id %s', facilityId);
            return false;
        }
        const response = yield axios({
            method: 'get',
            url: `${DTFS_CENTRAL_API_URL}/v1/portal/facilities/${facilityId}`,
            headers: headers.central,
        });
        return response.data;
    }
    catch (error) {
        console.error('Unable to find one facility %o', error);
        return false;
    }
});
const updateFacility = (facilityId, facility, user) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!isValidMongoId(facilityId)) {
            console.error('Update facility API failed for facility id %s', facilityId);
            return false;
        }
        return yield axios({
            method: 'put',
            url: `${DTFS_CENTRAL_API_URL}/v1/portal/facilities/${facilityId}`,
            headers: headers.central,
            data: Object.assign(Object.assign({}, facility), { user }),
        });
    }
    catch (error) {
        console.error('Unable to update facility %o', error);
        return { status: (error === null || error === void 0 ? void 0 : error.code) || 500, data: 'Error when updating facility' };
    }
});
const deleteFacility = (facilityId, user) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!isValidMongoId(facilityId)) {
            console.error('Delete facility API failed for facility id %s', facilityId);
            return false;
        }
        return yield axios({
            method: 'delete',
            url: `${DTFS_CENTRAL_API_URL}/v1/portal/facilities/${facilityId}`,
            headers: headers.central,
            data: {
                user,
            },
        });
    }
    catch (error) {
        console.error('Unable to delete facility %o', error);
        return { status: ((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.status) || 500, data: 'Error when deleting facility' };
    }
});
const tfmDealSubmit = (dealId, dealType, checker) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios({
            method: 'put',
            url: `${TFM_API_URL}/v1/deals/submit`,
            headers: headers.tfm,
            data: {
                dealId,
                dealType,
                checker,
            },
        });
        return response.data;
    }
    catch (error) {
        console.error('Unable to submit deal %s to TFM %o', dealId, error);
        return false;
    }
});
const findLatestGefMandatoryCriteria = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const response = yield axios({
            method: 'get',
            url: `${DTFS_CENTRAL_API_URL}/v1/portal/gef/mandatory-criteria/latest`,
            headers: headers.central,
        });
        return { status: 200, data: response.data };
    }
    catch (error) {
        console.error('Unable to get the latest mandatory criteria for GEF deals %o', error);
        return { status: ((_b = error === null || error === void 0 ? void 0 : error.response) === null || _b === void 0 ? void 0 : _b.status) || 500, data: 'Failed to get latest mandatory criteria for GEF deals' };
    }
});
const saveUtilisationReport = (reportData, reportPeriod, user, fileInfo) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield axios({
            method: 'post',
            url: `${DTFS_CENTRAL_API_URL}/v1/utilisation-reports`,
            headers: headers.central,
            data: {
                reportData,
                reportPeriod,
                user,
                fileInfo,
            },
        });
    }
    catch ({ response }) {
        return { status: (response === null || response === void 0 ? void 0 : response.status) || 500 };
    }
});
/**
 * @typedef {Object} GetUtilisationReportsOptions
 * @property {import('../types/utilisation-reports').ReportPeriod} [reportPeriod] - a report period to filter reports by
 * @property {boolean} [excludeNotUploaded] - whether or not to exclude reports which have not been uploaded
 */
/**
 * Gets utilisation reports for a specific bank. If a report
 * period or statuses are not provided, all reports for that bank are
 * returned. If a report period is provided, the report
 * submitted for that report period is returned. If an array of report
 * statuses are provided, the reports returned are filtered by status.
 * Returned reports are ordered by year and month ascending.
 * @param {string} bankId
 * @param {GetUtilisationReportsOptions} [options]
 */
const getUtilisationReports = (bankId, options) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const reportPeriod = options === null || options === void 0 ? void 0 : options.reportPeriod;
    const excludeNotUploaded = options === null || options === void 0 ? void 0 : options.excludeNotUploaded;
    try {
        if (!isValidBankId(bankId)) {
            console.error('Get utilisation reports failed with the following bank ID %s', bankId);
            throw new Error(`Invalid bank ID provided ${bankId}`);
        }
        if (reportPeriod && !isValidReportPeriod(reportPeriod)) {
            console.error('Get utilisation reports failed with the following report period %s', reportPeriod);
            throw new Error(`Invalid report period provided ${reportPeriod}`);
        }
        if (excludeNotUploaded && typeof excludeNotUploaded !== 'boolean') {
            console.error('Get utilisation reports failed with the following excludeNotUploaded query %s', excludeNotUploaded);
            throw new Error(`Invalid excludeNotUploaded provided: ${excludeNotUploaded} (expected a boolean)`);
        }
        const params = { reportPeriod, excludeNotUploaded };
        const response = yield axios.get(`${DTFS_CENTRAL_API_URL}/v1/bank/${bankId}/utilisation-reports`, {
            headers: headers.central,
            params,
        });
        return response.data;
    }
    catch (error) {
        console.error('Unable to get previous utilisation reports %o', error);
        throw error;
    }
});
const getUtilisationReportById = (_id) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!isValidMongoId(_id)) {
            throw new Error(`Invalid MongoDB _id provided: '${_id}'`);
        }
        const response = yield axios.get(`${DTFS_CENTRAL_API_URL}/v1/utilisation-reports/${_id}`, {
            headers: headers.central,
        });
        return response.data;
    }
    catch (error) {
        console.error(`Unable to get utilisation report with MongoDB _id '${_id}'`, error);
        throw error;
    }
});
const getBankById = (bankId) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        if (!isValidBankId(bankId)) {
            console.error('Get bank failed with the following bank ID %s', bankId);
            return false;
        }
        const response = yield axios({
            method: 'get',
            url: `${DTFS_CENTRAL_API_URL}/v1/bank/${bankId}`,
            headers: headers.central,
        });
        return { status: 200, data: response.data };
    }
    catch (error) {
        console.error('Unable to get bank by ID %o', error);
        return { status: ((_c = error === null || error === void 0 ? void 0 : error.response) === null || _c === void 0 ? void 0 : _c.status) || 500, data: 'Failed to get bank by ID' };
    }
});
const getAllBanks = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios.get(`${DTFS_CENTRAL_API_URL}/v1/bank`, {
            headers: headers.central,
        });
        return response.data;
    }
    catch (error) {
        console.error('Failed to get all banks', error);
        throw error;
    }
});
module.exports = {
    findOneDeal,
    createDeal,
    updateDeal,
    deleteDeal,
    addDealComment,
    createFacility,
    createMultipleFacilities,
    findOneFacility,
    updateFacility,
    deleteFacility,
    tfmDealSubmit,
    findLatestGefMandatoryCriteria,
    saveUtilisationReport,
    getUtilisationReports,
    getUtilisationReportById,
    getBankById,
    getAllBanks,
};
