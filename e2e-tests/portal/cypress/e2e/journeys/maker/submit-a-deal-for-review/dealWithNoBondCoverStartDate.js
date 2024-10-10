const dealReadyToSubmitForReview = require('./dealReadyToSubmitForReview');
const { oneMonth } = require('../../../../../../e2e-fixtures/dateConstants');

const dealWithNoCoverStartDate = { ...dealReadyToSubmitForReview };

const bond = dealWithNoCoverStartDate.mockFacilities.find((f) => f.type === 'Bond');

bond['coverEndDate-day'] = oneMonth.dayLong;
bond['coverEndDate-month'] = oneMonth.monthLong;
bond['coverEndDate-year'] = oneMonth.year;
bond.facilityStage = 'Issued';
bond.hasBeenIssued = true;

module.exports = dealWithNoCoverStartDate;
