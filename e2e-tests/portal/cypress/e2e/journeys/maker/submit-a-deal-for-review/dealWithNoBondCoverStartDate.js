const dealReadyToSubmitForReview = require('./dealReadyToSubmitForReview');
const { oneMonth } = require('../../../../../../e2e-fixtures/dateConstants');

const nowPlusMonthDay = oneMonth.dayLong;
const nowPlusMonthMonth = oneMonth.monthLong;
const nowPlusMonthYear = oneMonth.year;

const dealWithNoCoverStartDate = { ...dealReadyToSubmitForReview };

const bond = dealWithNoCoverStartDate.mockFacilities.find((f) => f.type === 'Bond');

bond['coverEndDate-day'] = nowPlusMonthDay;
bond['coverEndDate-month'] = nowPlusMonthMonth;
bond['coverEndDate-year'] = nowPlusMonthYear;
bond.facilityStage = 'Issued';
bond.hasBeenIssued = true;

module.exports = dealWithNoCoverStartDate;
