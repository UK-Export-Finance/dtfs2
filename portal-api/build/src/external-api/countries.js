"use strict";
const tslib_1 = require("tslib");
const axios = require('axios');
const dotenv = require('dotenv');
const { isValidRegex } = require('../v1/validation/validateIds');
const { COUNTRY_CODE } = require('../constants/regex');
dotenv.config();
const { EXTERNAL_API_URL, EXTERNAL_API_KEY } = process.env;
const headers = {
    'Content-Type': 'application/json',
    'x-api-key': String(EXTERNAL_API_KEY),
};
/**
 * Retrieves a list of countries from an external API.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of country objects.
 */
const getCountries = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const response = yield axios({
        method: 'get',
        url: `${EXTERNAL_API_URL}/countries`,
        headers,
    }).catch((error) => {
        var _a;
        console.error('Error retrieving countries from External API %o', error);
        return { status: ((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.status) || 500, data: 'Failed to get countries' };
    });
    return (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.countries;
});
/**
 * Retrieves country information from an external API based on the provided country code.
 *
 * @param {string} code - The country code to retrieve information for.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the status and data of the requested country.
 *
 * @example
 * // Returns { status: 200, data: { name: 'United Kingdom' } }
 * getCountry('GBR');
 *
 * @example
 * // Returns { status: 404 }
 * getCountry('INVALID');
 */
const getCountry = (code) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!isValidRegex(COUNTRY_CODE, code)) {
        console.error('Invalid country code supplied %s', code);
        return {
            status: 400,
            error: 'Invalid country code supplied',
        };
    }
    const response = yield axios({
        method: 'get',
        url: `${EXTERNAL_API_URL}/countries/${code}`,
        headers,
    }).catch((error) => {
        console.error('Error retrieving country from External API %o', error);
        return {
            status: 500,
            error: 'Failed to get country',
        };
    });
    if (response === null || response === void 0 ? void 0 : response.data) {
        return {
            status: 200,
            data: response.data,
        };
    }
    return {
        status: 404,
        error: 'Invalid response received'
    };
});
module.exports = {
    getCountries,
    getCountry,
};
