const moment = require('moment');

const date = moment().add(1, 'month');
const dealReadyToSubmitForReview = require('./dealReadyToSubmitForReview');

const dealWithNoCoverStartDate = {...dealReadyToSubmitForReview };

const bond = dealWithNoCoverStartDate.mockFacilities.find((f) => f.facilityType === 'bond');

bond['coverEndDate-day'] = moment(date).format('DD');
bond['coverEndDate-month'] = moment(date).format('MM');
bond['coverEndDate-year'] = moment(date).format('YYYY');
bond.facilityStage = 'Issued';

module.exports = dealWithNoCoverStartDate;
