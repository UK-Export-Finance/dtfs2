const dealReadyToSubmitForReview = require('./dealReadyToSubmitForReview');
const dateConstants = require('../../../../../../e2e-fixtures/dateConstants');

const nowPlusMonthDay = (dateConstants.oneMonthDay).toString();
const nowPlusMonthMonth = (dateConstants.oneMonthMonth).toString();
const nowPlusMonthYear = (dateConstants.oneMonthYear).toString();

const dealWithNoCoverStartDate = { ...dealReadyToSubmitForReview };

const bond = dealWithNoCoverStartDate.mockFacilities.find((f) => f.type === 'Bond');

bond['coverEndDate-day'] = nowPlusMonthDay;
bond['coverEndDate-month'] = nowPlusMonthMonth;
bond['coverEndDate-year'] = nowPlusMonthYear;
bond.facilityStage = 'Issued';
bond.hasBeenIssued = true;

module.exports = dealWithNoCoverStartDate;
