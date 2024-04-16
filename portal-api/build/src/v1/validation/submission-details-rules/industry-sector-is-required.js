"use strict";
const { orderNumber } = require('../../../utils/error-list-order-number');
module.exports = (submissionDetails, errorList) => {
    const newErrorList = Object.assign({}, errorList);
    const industrySector = submissionDetails['industry-sector'];
    if (!industrySector || Object.keys(industrySector).length < 2) {
        newErrorList['industry-sector'] = {
            order: orderNumber(newErrorList),
            text: 'Industry Sector is required',
        };
    }
    return newErrorList;
};
