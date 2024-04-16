"use strict";
const tslib_1 = require("tslib");
const { getCountry } = require('../../controllers/countries.controller');
/**
 * Retrieves the disabled status of a country based on its country code.
 * @param {string} code - The country code.
 * @returns {Promise<Boolean>} - The disabled status of the country.
 */
const isCountryDisabled = (code) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { data } = yield getCountry(code);
    return Boolean(data === null || data === void 0 ? void 0 : data.disabled);
});
module.exports = {
    isCountryDisabled,
};
