"use strict";
const { hasValue } = require('../../../utils/string');
const { orderNumber } = require('../../../utils/error-list-order-number');
module.exports = (facility, errorList) => {
    const newErrorList = Object.assign({}, errorList);
    const { currencySameAsSupplyContractCurrency, } = facility;
    if (!hasValue(currencySameAsSupplyContractCurrency)) {
        newErrorList.currencySameAsSupplyContractCurrency = {
            order: orderNumber(newErrorList),
            text: 'Select if the currency for this Transaction is the same as your Supply Contract currency',
        };
    }
    return newErrorList;
};
