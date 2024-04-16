"use strict";
const tslib_1 = require("tslib");
const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');
const { isCountryDisabled } = require('../fields/country');
module.exports = (submissionDetails, errorList) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const newErrorList = Object.assign({}, errorList);
    if (!submissionDetails['buyer-address-country']
        || !submissionDetails['buyer-address-country'].code) {
        newErrorList['buyer-address-country'] = {
            order: orderNumber(newErrorList),
            text: 'Buyer country is required',
        };
    }
    if (!hasValue(submissionDetails['buyer-address-line-1'])) {
        newErrorList['buyer-address-line-1'] = {
            order: orderNumber(newErrorList),
            text: 'Buyer address line 1 is required',
        };
    }
    if (submissionDetails['buyer-address-country'] && submissionDetails['buyer-address-country'].code === 'GBR') {
        if (!hasValue(submissionDetails['buyer-address-postcode'])) {
            newErrorList['buyer-address-postcode'] = {
                order: orderNumber(newErrorList),
                text: 'Buyer postcode is required for UK addresses',
            };
        }
    }
    else if (!hasValue(submissionDetails['buyer-address-town'])) {
        newErrorList['buyer-address-town'] = {
            order: orderNumber(newErrorList),
            text: 'Buyer town is required for non-UK addresses',
        };
    }
    if (submissionDetails['buyer-address-country']) {
        const isDisabled = yield isCountryDisabled(submissionDetails['buyer-address-country'].code);
        if (isDisabled) {
            newErrorList['buyer-address-country'] = {
                order: orderNumber(newErrorList),
                text: 'Buyer country is no longer available',
            };
        }
    }
    return newErrorList;
});
