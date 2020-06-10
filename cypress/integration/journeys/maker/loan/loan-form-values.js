const moment = require('moment');

const date = moment();
const requestedCoverStartDate = date;
const coverEndDate = moment(date).add(1, 'months');

const GUARANTEE_DETAILS = {
  facilityStage: 'Conditional',

  // 'Conditional' facility stage specifics
  ukefGuaranteeInMonths: '12',

  // 'Unconditional' facility stage specifics
  bankReferenceNumber: '123456',
  requestedCoverStartDateDay: moment(requestedCoverStartDate).format('DD'),
  requestedCoverStartDateMonth: moment(requestedCoverStartDate).format('MM'),
  requestedCoverStartDateYear: moment(requestedCoverStartDate).format('YYYY'),
  coverEndDateDay: moment(coverEndDate).format('DD'),
  coverEndDateMonth: moment(coverEndDate).format('MM'),
  coverEndDateYear: moment(coverEndDate).format('YYYY'),

};

module.exports = {
  GUARANTEE_DETAILS,
};
