"use strict";
const tslib_1 = require("tslib");
const { updateDeal } = require('../deal.controller');
const updateStatus = (dealId, from, to) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const modifiedDeal = {
        updatedAt: Date.now(),
        status: to,
    };
    if (from !== to) {
        modifiedDeal.previousStatus = from;
    }
    const updatedDeal = yield updateDeal(dealId, modifiedDeal);
    return updatedDeal;
});
module.exports = updateStatus;
