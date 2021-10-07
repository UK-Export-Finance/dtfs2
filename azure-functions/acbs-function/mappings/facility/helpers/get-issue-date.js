
const { formatTimestamp } = require('../../../helpers/date');
const isIssued = require('./is-issued');

const getIssueDate = (facility, submissionDate) => {
  if (facility.facilitySnapshot.facilityStage) {
    return isIssued(facility.facilitySnapshot.facilityStage)
      ? formatTimestamp(facility.facilitySnapshot.requestedCoverStartDate)
      : formatTimestamp(submissionDate);
  }
  return formatTimestamp(submissionDate);
};

module.exports = getIssueDate;
