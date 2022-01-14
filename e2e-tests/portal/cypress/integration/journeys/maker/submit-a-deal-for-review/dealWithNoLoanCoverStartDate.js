const dealReadyToSubmitForReview = require('./dealReadyToSubmitForReview');
const { nowPlusMonths } = require('../../../../support/utils/dateFuncs');

const date = nowPlusMonths(1);

const dealWithNoCoverStartDate = { ...dealReadyToSubmitForReview };

const loan = dealWithNoCoverStartDate.mockFacilities.find((f) => f.facilityType === 'Loan');

loan['coverEndDate-day'] = (date.getDate()).toString();
loan['coverEndDate-month'] = (date.getMonth() + 1).toString();
loan['coverEndDate-year'] = (date.getFullYear()).toString();
loan.facilityStage = 'Unconditional';
loan.hasBeenIssued = true;

module.exports = dealWithNoCoverStartDate;
