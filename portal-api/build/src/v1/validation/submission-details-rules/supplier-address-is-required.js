"use strict";
const tslib_1 = require("tslib");
const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');
const { isCountryDisabled } = require('../fields/country');
module.exports = (submissionDetails, errorList) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const newErrorList = Object.assign({}, errorList);
    if (!hasValue(submissionDetails['supplier-address-line-1'])) {
        newErrorList['supplier-address-line-1'] = {
            order: orderNumber(newErrorList),
            text: 'Supplier address line 1 is required',
        };
    }
    if (submissionDetails['supplier-address-country'] && (submissionDetails['supplier-address-country'].code === 'GBR')) {
        if (!hasValue(submissionDetails['supplier-address-postcode'])) {
            newErrorList['supplier-address-postcode'] = {
                order: orderNumber(newErrorList),
                text: 'Supplier postcode is required for UK addresses',
            };
        }
    }
    else if (!hasValue(submissionDetails['supplier-address-town'])) {
        newErrorList['supplier-address-town'] = {
            order: orderNumber(newErrorList),
            text: 'Supplier town is required for non-UK addresses',
        };
    }
    if (!submissionDetails['supplier-address-country']
        || !submissionDetails['supplier-address-country'].code) {
        newErrorList['supplier-address-country'] = {
            order: orderNumber(newErrorList),
            text: 'Supplier country is required',
        };
    }
    if (submissionDetails['supplier-address-country']) {
        const isDisabled = yield isCountryDisabled(submissionDetails['supplier-address-country'].code);
        if (isDisabled) {
            newErrorList['supplier-address-country'] = {
                order: orderNumber(newErrorList),
                text: 'Supplier country is no longer available',
            };
        }
    }
    return newErrorList;
});
