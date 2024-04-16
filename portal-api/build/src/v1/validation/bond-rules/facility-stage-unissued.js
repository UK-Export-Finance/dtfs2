"use strict";
const { hasValue } = require('../../../utils/string');
const ukefGuaranteeInMonths = require('../fields/ukef-guarantee-in-months');
module.exports = (bond, errorList) => {
    let newErrorList = Object.assign({}, errorList);
    const { facilityStage } = bond;
    const isUnissued = (hasValue(facilityStage) && facilityStage === 'Unissued');
    if (isUnissued) {
        newErrorList = ukefGuaranteeInMonths(bond, newErrorList);
    }
    return newErrorList;
};
