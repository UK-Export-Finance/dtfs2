const { formatDate } = require('../../../helpers/date');
const hasFacilityBeenIssued = require('./get-facility-issue-status');
const getCoverStartDate = require('./get-cover-start-date');

const getIssueDate = (facility, submissionDate) => {
  if (facility.facilitySnapshot) {
    return hasFacilityBeenIssued(facility) ? formatDate(getCoverStartDate(facility, true)) : formatDate(submissionDate);
  }
  return formatDate(submissionDate);
};

module.exports = getIssueDate;
