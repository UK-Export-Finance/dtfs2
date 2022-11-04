const dealReadyToSubmitForReview = require('./dealReadyToSubmitForReview');
const dateConstants = require('../../../../../../e2e-fixtures/dateConstants');

const nowPlusMonthDay = (dateConstants.oneMonthDay).toString();
const nowPlusMonthMonth = (dateConstants.oneMonthMonth).toString();
const nowPlusMonthYear = (dateConstants.oneMonthYear).toString();

const dealWithNoCoverStartDate = { ...dealReadyToSubmitForReview };

const loan = dealWithNoCoverStartDate.mockFacilities.find((f) => f.type === 'Loan');

loan['coverEndDate-day'] = nowPlusMonthDay;
loan['coverEndDate-month'] = nowPlusMonthMonth;
loan['coverEndDate-year'] = nowPlusMonthYear;
loan.facilityStage = 'Unconditional';
loan.hasBeenIssued = true;

module.exports = dealWithNoCoverStartDate;
