const { oneMonth } = require('@ukef/dtfs2-common/test-helpers');
const dealReadyToSubmitForReview = require('./dealReadyToSubmitForReview');

const dealWithNoCoverStartDate = { ...dealReadyToSubmitForReview };

const loan = dealWithNoCoverStartDate.mockFacilities.find((f) => f.type === 'Loan');

loan['coverEndDate-day'] = oneMonth.dayLong;
loan['coverEndDate-month'] = oneMonth.monthLong;
loan['coverEndDate-year'] = oneMonth.year;
loan.facilityStage = 'Unconditional';
loan.hasBeenIssued = true;

module.exports = dealWithNoCoverStartDate;
