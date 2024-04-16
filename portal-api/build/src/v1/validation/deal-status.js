"use strict";
const tslib_1 = require("tslib");
const validate = require('./completeDealValidation-flat');
module.exports = (deal, requestedUpdate) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let errorList = {};
    if (requestedUpdate.status === 'Abandoned') {
        if (!requestedUpdate.comments) {
            errorList.comments = {
                order: '1',
                text: 'Comment is required when abandoning a deal.',
            };
        }
    }
    if (requestedUpdate.status === "Ready for Checker's approval") {
        if (!requestedUpdate.comments) {
            errorList.comments = {
                order: '1',
                text: 'Comment is required when submitting a deal for review.',
            };
        }
    }
    if (requestedUpdate.status === "Further Maker's input required") {
        if (!requestedUpdate.comments) {
            errorList.comments = {
                order: '1',
                text: 'Comment is required when returning a deal to maker.',
            };
        }
    }
    if (requestedUpdate.status === 'Submitted') {
        if (!requestedUpdate.confirmSubmit) {
            errorList.confirmSubmit = {
                order: '1',
                text: 'Acceptance is required.',
            };
        }
        const validationOfExistingDeal = yield validate(deal);
        if (validationOfExistingDeal) {
            errorList = Object.assign(Object.assign({}, validationOfExistingDeal), errorList);
        }
    }
    const totalErrors = Object.keys(errorList).length;
    if (totalErrors === 0) {
        return false;
    }
    return {
        count: totalErrors,
        errorList,
    };
});
