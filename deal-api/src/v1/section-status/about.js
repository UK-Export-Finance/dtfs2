const submissionDetailsRules = require('../validation/submission-details-rules');

const aboutSupplyContractStatus = (submissionDetails) => {
  if (submissionDetails.status === 'Not Started') {
    return 'Not Started';
  }

  const validationErrors = submissionDetailsRules(submissionDetails);
  if (Object.keys(validationErrors).length > 0) {
    return 'Incomplete';
  }
  return 'Completed';
};

module.exports = {
  aboutSupplyContractStatus,
};
