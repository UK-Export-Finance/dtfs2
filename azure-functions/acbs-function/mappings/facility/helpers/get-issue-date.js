
const { formatTimestamp } = require('../../../helpers/date');
const isIssued = require('./is-issued');

const getIssueDate = (facility, submissionDate) => (
  isIssued(facility)
    ? formatTimestamp(facility.facilitySnapshot.requestedCoverStartDate)
    : formatTimestamp(submissionDate)
);

module.exports = getIssueDate;
