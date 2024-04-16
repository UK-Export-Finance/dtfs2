"use strict";
const marginFee = require('../fields/margin-fee');
module.exports = (loan, errorList) => {
    let newErrorList = Object.assign({}, errorList);
    newErrorList = marginFee(loan, 'riskMarginFee', 'Risk Margin Fee %', newErrorList);
    return newErrorList;
};
