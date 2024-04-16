"use strict";
const facilityValue = require('../fields/facility-value');
module.exports = (loan, errorList) => {
    let newErrorList = Object.assign({}, errorList);
    newErrorList = facilityValue(loan, 'Loan facility value', newErrorList);
    return newErrorList;
};
