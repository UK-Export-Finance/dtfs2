"use strict";
const tslib_1 = require("tslib");
const { updateDeal } = require('../deal.controller');
const { getNowAsEpochMillisecondString } = require('../../helpers/date');
const createApprovalDate = (dealId) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const modifiedDeal = {
        details: {
            approvalDate: getNowAsEpochMillisecondString(),
        },
    };
    const updatedDeal = yield updateDeal(dealId, modifiedDeal);
    return updatedDeal;
});
module.exports = createApprovalDate;
