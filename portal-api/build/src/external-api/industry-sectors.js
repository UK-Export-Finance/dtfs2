"use strict";
const tslib_1 = require("tslib");
const axios = require('axios');
const dotenv = require('dotenv');
const { isValidRegex } = require('../v1/validation/validateIds');
const { INDUSTRY_SECTOR_ID } = require('../constants/regex');
dotenv.config();
const { EXTERNAL_API_URL, EXTERNAL_API_KEY } = process.env;
const headers = {
    'Content-Type': 'application/json',
    'x-api-key': String(EXTERNAL_API_KEY),
};
const getIndustrySectors = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { status, data } = yield axios({
        method: 'get',
        url: `${EXTERNAL_API_URL}/industry-sectors`,
        headers,
    }).catch((error) => {
        var _a;
        console.error('Error retrieving industry sectors from External API. %o', error);
        return { status: ((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.status) || 500, data: 'Failed to get industry sectors' };
    });
    return {
        status,
        industrySectors: data.industrySectors,
    };
});
const getIndustrySector = (id) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!isValidRegex(INDUSTRY_SECTOR_ID, id)) {
        console.error('industry-sectors.getIndustrySector: invalid id provided %s', id);
        return { status: 400 };
    }
    const { status, data } = yield axios({
        method: 'get',
        url: `${EXTERNAL_API_URL}/industry-sectors/${id}`,
        headers,
    }).catch((error) => {
        console.error('Error retrieving industry sector from External API. %o', error);
        return { status: 404, error };
    });
    return { status, data };
});
module.exports = {
    getIndustrySectors,
    getIndustrySector,
};
