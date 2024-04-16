"use strict";
const tslib_1 = require("tslib");
const { updateDeal } = require('../deal.controller');
const { getNowAsEpochMillisecondString } = require('../../helpers/date');
const createSubmissionDate = (dealId, user) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const modifiedDeal = {
        details: {
            submissionDate: getNowAsEpochMillisecondString(),
            checker: user,
        },
    };
    const updatedDeal = yield updateDeal(dealId, modifiedDeal, user);
    return updatedDeal;
});
module.exports = createSubmissionDate;
