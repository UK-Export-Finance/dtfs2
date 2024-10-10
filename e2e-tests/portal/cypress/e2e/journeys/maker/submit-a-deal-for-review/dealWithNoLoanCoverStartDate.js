const dealReadyToSubmitForReview = require('./dealReadyToSubmitForReview');
const { oneMonth } = require('../../../../../../e2e-fixtures/dateConstants');

const dealWithNoCoverStartDate = { ...dealReadyToSubmitForReview };

const loan = dealWithNoCoverStartDate.mockFacilities.find((f) => f.type === 'Loan');

loan['coverEndDate-day'] = oneMonth.dayLong;
loan['coverEndDate-month'] = oneMonth.monthLong;
loan['coverEndDate-year'] = oneMonth.year;
loan.facilityStage = 'Unconditional';
loan.hasBeenIssued = true;

module.exports = dealWithNoCoverStartDate;
