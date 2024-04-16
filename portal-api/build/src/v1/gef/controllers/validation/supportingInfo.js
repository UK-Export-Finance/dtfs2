"use strict";
const CONSTANTS = require('../../../../constants');
const supportingInfoStatus = (supportingInfo) => {
    var _a;
    if (supportingInfo) {
        const requiredCount = (_a = supportingInfo.requiredFields) === null || _a === void 0 ? void 0 : _a.length;
        const supportingInfoAnswers = supportingInfo;
        delete supportingInfoAnswers.requiredFields;
        delete supportingInfoAnswers.status;
        const answeredCount = Object.keys(supportingInfoAnswers).length;
        if (!answeredCount) {
            return CONSTANTS.DEAL.DEAL_STATUS.NOT_STARTED;
        }
        if (answeredCount === requiredCount) {
            return CONSTANTS.DEAL.DEAL_STATUS.COMPLETED;
        }
        return CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS;
    }
    return CONSTANTS.DEAL.DEAL_STATUS.NOT_STARTED;
};
module.exports = {
    supportingInfoStatus,
};
