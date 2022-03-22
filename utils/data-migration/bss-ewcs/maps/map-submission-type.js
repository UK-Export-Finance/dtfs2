const CONSTANTS = require('../../../portal-api/src/constants');

const mapSubmissionType = (v1Deal) => {
  const applicationRoute = v1Deal.Application_route;

  let submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.AIN;

  if (applicationRoute === 'ATP') {
    const statusToCompare = ['ready_for_approval', 'further_input_required'].includes(v1Deal.Deal_information.Extra_fields.Deal_status)
      ? v1Deal.Deal_information.Extra_fields.Deal_previous_status
      : v1Deal.Deal_information.Extra_fields.Deal_status;

    submissionType = ['confirmed_by_bank', 'confirmation_acknowledged'].includes(statusToCompare)
      ? CONSTANTS.DEAL.SUBMISSION_TYPE.MIN
      : CONSTANTS.DEAL.SUBMISSION_TYPE.MIA;
  }
  
  return submissionType;
};


module.exports = mapSubmissionType;
