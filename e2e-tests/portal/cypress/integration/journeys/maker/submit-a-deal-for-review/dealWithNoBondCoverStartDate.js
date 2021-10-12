const dealReadyToSubmitForReview = require('./dealReadyToSubmitForReview');
const { nowPlusMonths } = require('../../../../support/utils/dateFuncs');

const date = nowPlusMonths(1);

const dealWithNoCoverStartDate = { ...dealReadyToSubmitForReview };

const bond = dealWithNoCoverStartDate.mockFacilities.find((f) => f.facilityType === 'bond');

bond['coverEndDate-day'] = date.getDate();
bond['coverEndDate-month'] = date.getMonth() + 1;
bond['coverEndDate-year'] = date.getFullYear();
bond.facilityStage = 'Issued';

module.exports = dealWithNoCoverStartDate;
