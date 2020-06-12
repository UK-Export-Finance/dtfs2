const moment = require('moment');

const date = moment().add(1, 'month');
const dealReadyToSubmitForReview = require('./dealReadyToSubmitForReview');

const dealWithNoCoverStartDate = {...dealReadyToSubmitForReview };

dealWithNoCoverStartDate.loanTransactions.items[0]['coverEndDate-day'] = moment(date).format('DD');
dealWithNoCoverStartDate.loanTransactions.items[0]['coverEndDate-month'] = moment(date).format('MM');
dealWithNoCoverStartDate.loanTransactions.items[0]['coverEndDate-year'] = moment(date).format('YYYY');
dealWithNoCoverStartDate.loanTransactions.items[0].facilityStage = 'Unconditional';

module.exports = dealWithNoCoverStartDate;
