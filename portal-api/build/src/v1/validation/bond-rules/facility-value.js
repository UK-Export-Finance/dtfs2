"use strict";
const facilityValue = require('../fields/facility-value');
module.exports = (bond, errorList) => {
    let newErrorList = Object.assign({}, errorList);
    newErrorList = facilityValue(bond, 'Bond value', newErrorList);
    return newErrorList;
};
