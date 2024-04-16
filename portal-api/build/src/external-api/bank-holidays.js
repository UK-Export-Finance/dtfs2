"use strict";
const tslib_1 = require("tslib");
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
const { EXTERNAL_API_URL, EXTERNAL_API_KEY } = process.env;
const headers = {
    'Content-Type': 'application/json',
    'x-api-key': String(EXTERNAL_API_KEY),
};
/**
 * Resolves to the response of `GET /bank-holidays` from external-api.
 * @returns {import('./types').BankHolidaysResponseBody}
 */
const getBankHolidays = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios.get(`${EXTERNAL_API_URL}/bank-holidays`, { headers });
    return response.data;
});
/**
 * Fetches a list of bank holiday dates for the specified UK region
 * @param {import('./types').BankHolidayRegion} region
 * @returns {Promise<Date[]>}
 */
const getBankHolidayDatesForRegion = (region) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const allUkBankHolidays = yield getBankHolidays();
    return allUkBankHolidays[region].events.map((event) => new Date(event.date));
});
module.exports = {
    getBankHolidays,
    getBankHolidayDatesForRegion,
};
