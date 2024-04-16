"use strict";
const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');
module.exports = (submissionDetails, errorList) => {
    const newErrorList = Object.assign({}, errorList);
    if (!hasValue(submissionDetails['supplier-type'])) {
        newErrorList['supplier-type'] = {
            order: orderNumber(newErrorList),
            text: 'Supplier type is required',
        };
    }
    return newErrorList;
};
