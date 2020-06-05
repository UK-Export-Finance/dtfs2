const moment = require('moment');
const date = moment().add(1, 'month');
const dealReadyToSubmitForReview = require('./dealReadyToSubmitForReview.json');

const dealWithNoCoverStartDate = {...dealReadyToSubmitForReview};

dealWithNoCoverStartDate.bondTransactions.items[0]["coverEndDate-day"] = moment(date).format('DD');
dealWithNoCoverStartDate.bondTransactions.items[0]["coverEndDate-month"] = moment(date).format('MM');
dealWithNoCoverStartDate.bondTransactions.items[0]["coverEndDate-year"] = moment(date).format('YYYY');
dealWithNoCoverStartDate.bondTransactions.items[0]["bondStage"] = 'Issued';

module.exports = dealWithNoCoverStartDate;
