const { formatTimestamp } = require('../../../helpers/date');
const hasFacilityBeenIssued = require('./get-facility-issue-status');
const getCoverStartDate = require('./get-cover-start-date');

const getIssueDate = (facility, submissionDate) => {
  if (facility.facilitySnapshot) {
    return hasFacilityBeenIssued(facility)
      ? formatTimestamp(getCoverStartDate(facility, true))
      : formatTimestamp(submissionDate);
  }
  return formatTimestamp(submissionDate);
};

module.exports = getIssueDate;
