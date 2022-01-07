const dealReadyToSubmitForReview = require('./dealReadyToSubmitForReview');
const { nowPlusMonths } = require('../../../../support/utils/dateFuncs');

const date = nowPlusMonths(1);

const dealWithNoCoverStartDate = { ...dealReadyToSubmitForReview };

const bond = dealWithNoCoverStartDate.mockFacilities.find((f) => f.facilityType === 'bond');

bond['coverEndDate-day'] = (date.getDate()).toString();
bond['coverEndDate-month'] = (date.getMonth() + 1).toString();
bond['coverEndDate-year'] = (date.getFullYear()).toString();
bond.facilityStage = 'Issued';

module.exports = dealWithNoCoverStartDate;
