"use strict";
const tslib_1 = require("tslib");
const applyRules = require('./submission-details-rules');
/**
 * Applies a set of rules to the requested update and returns an object containing the count of errors and the error list.
 * @param {any} requestedUpdate - The input data to be processed by the rules.
 * @returns {Promise<{ count: number, errorList: object }>} - An object with the count of errors and the error list.
 */
module.exports = (requestedUpdate) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const errorList = yield applyRules(requestedUpdate);
    const count = Object.keys(errorList).length;
    return { count, errorList };
});
