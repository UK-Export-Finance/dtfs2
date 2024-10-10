const dealReadyToSubmitForReview = require('./dealReadyToSubmitForReview');
const { oneMonth } = require('../../../../../../e2e-fixtures/dateConstants');

const nowPlusMonthDay = oneMonth.dayLong;
const nowPlusMonthMonth = oneMonth.monthLong;
const nowPlusMonthYear = oneMonth.year;

const dealWithNoCoverStartDate = { ...dealReadyToSubmitForReview };

const loan = dealWithNoCoverStartDate.mockFacilities.find((f) => f.type === 'Loan');

loan['coverEndDate-day'] = nowPlusMonthDay;
loan['coverEndDate-month'] = nowPlusMonthMonth;
loan['coverEndDate-year'] = nowPlusMonthYear;
loan.facilityStage = 'Unconditional';
loan.hasBeenIssued = true;

module.exports = dealWithNoCoverStartDate;
