"use strict";
const tslib_1 = require("tslib");
const { updateDeal } = require('../deal.controller');
const updateSubmissionCount = (deal, user) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const dealId = deal._id;
    let submissionCount = 1;
    if ((_a = deal === null || deal === void 0 ? void 0 : deal.details) === null || _a === void 0 ? void 0 : _a.submissionCount) {
        submissionCount = deal.details.submissionCount + 1;
    }
    const modifiedDeal = {
        details: {
            submissionCount,
        },
    };
    const updatedDeal = yield updateDeal(dealId, modifiedDeal, user);
    return updatedDeal;
});
module.exports = updateSubmissionCount;
