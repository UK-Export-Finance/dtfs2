const moment = require('moment');

const date = moment().add(1, 'month');
const dealReadyToSubmitForReview = require('./dealReadyToSubmitForReview');

const dealWithNoCoverStartDate = {...dealReadyToSubmitForReview };

const loan = dealWithNoCoverStartDate.mockFacilities.find((f) => f.facilityType === 'loan');

loan['coverEndDate-day'] = moment(date).format('DD');
loan['coverEndDate-month'] = moment(date).format('MM');
loan['coverEndDate-year'] = moment(date).format('YYYY');
loan.facilityStage = 'Unconditional';

module.exports = dealWithNoCoverStartDate;
