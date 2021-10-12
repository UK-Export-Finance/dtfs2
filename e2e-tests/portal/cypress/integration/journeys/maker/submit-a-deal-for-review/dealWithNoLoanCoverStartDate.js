const dealReadyToSubmitForReview = require('./dealReadyToSubmitForReview');
const { nowPlusMonths } = require('../../../../support/utils/dateFuncs');

const date = nowPlusMonths(1);

const dealWithNoCoverStartDate = { ...dealReadyToSubmitForReview };

const loan = dealWithNoCoverStartDate.mockFacilities.find((f) => f.facilityType === 'loan');

loan['coverEndDate-day'] = date.getDate();
loan['coverEndDate-month'] = date.getMonth() + 1;
loan['coverEndDate-year'] = date.getFullYear();
loan.facilityStage = 'Unconditional';

module.exports = dealWithNoCoverStartDate;
