"use strict";
const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');
module.exports = (loan, errorList) => {
    const newErrorList = Object.assign({}, errorList);
    if (!hasValue(loan.premiumType)) {
        newErrorList.premiumType = {
            order: orderNumber(newErrorList),
            text: 'Enter the Premium type',
        };
    }
    if (loan.premiumType === 'In advance' || loan.premiumType === 'In arrear') {
        if (!hasValue(loan.premiumFrequency)) {
            newErrorList.premiumFrequency = {
                order: orderNumber(newErrorList),
                text: 'Enter the Premium frequency',
            };
        }
    }
    return newErrorList;
};
