"use strict";
const tslib_1 = require("tslib");
const axios = require('axios');
const dotenv = require('dotenv');
const { isValidCurrencyCode } = require('../v1/validation/validateIds');
dotenv.config();
const { EXTERNAL_API_URL, EXTERNAL_API_KEY } = process.env;
const headers = {
    'Content-Type': 'application/json',
    'x-api-key': String(EXTERNAL_API_KEY),
};
const getCurrencies = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios({
        method: 'get',
        url: `${EXTERNAL_API_URL}/currencies`,
        headers,
    }).catch((error) => {
        var _a, _b;
        console.error('Error retrieving currencies from External API. %o %s', (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data, error === null || error === void 0 ? void 0 : error.status);
        return { status: ((_b = error === null || error === void 0 ? void 0 : error.response) === null || _b === void 0 ? void 0 : _b.status) || 500, data: 'Failed to get currencies' };
    });
    return response.data && response.data.currencies;
});
const getCurrency = (id) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!isValidCurrencyCode(id)) {
        console.error('currencies.getCurrency: invalid code provided %s', id);
        return {
            status: 400
        };
    }
    const response = yield axios({
        method: 'get',
        url: `${EXTERNAL_API_URL}/currencies/${id}`,
        headers,
    }).catch((error) => {
        var _a;
        console.error('Error retrieving currency from External API. %o %s', (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data, error === null || error === void 0 ? void 0 : error.status);
        return {
            status: 404,
            error: 'Failed to get currency',
        };
    });
    if (response.data) {
        return {
            status: 200,
            data: response.data,
        };
    }
    return { status: 404 };
});
module.exports = {
    getCurrencies,
    getCurrency,
};
