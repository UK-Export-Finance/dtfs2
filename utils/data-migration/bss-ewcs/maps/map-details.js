const { getBssUserByEmail } = require('../../helpers/users');
const { convertV1Date } = require('../helpers/date-helpers');
const formatUkefId = require('../helpers/formatUkefId');
const log = require('../../helpers/logs');
const CONSTANTS = require('../../../../portal-api/src/constants');

const mapDetails = (portalDealId, v1Deal, v2SubmissionType) => {
  let hasError = false;

  const logError = (error) => {
    hasError = true;
    log.addError(portalDealId, error);
  };

  const details = {
    ukefDealId: formatUkefId(v1Deal.UKEF_deal_id),
    created: convertV1Date(v1Deal.Deal_information.Extra_fields.Deal_created),
  };

  if (v1Deal.Deal_information.Extra_fields.MIN_Checker.username) {
    const checkerMIN = getBssUserByEmail(v1Deal.Deal_information.Extra_fields.MIN_Checker.username);
    if (checkerMIN.username) {
      details.checkerMIN = checkerMIN;
    } else {
      logError(`no corresponding checkerMIN for v1 user ${v1Deal.Deal_information.Extra_fields.MIN_Checker.username}`);
    }
  }

  const submissionDate = v1Deal.Deal_information.Extra_fields.Submission_date_AIN_and_MIA;

  if (submissionDate) {
    details.submissionDate = convertV1Date(submissionDate);
  }

  if (v2SubmissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIA) {
    details.manualInclusionApplicationSubmissionDate = convertV1Date(submissionDate);
  }

  if (v2SubmissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIN) {
    details.manualInclusionNoticeSubmissionDate = convertV1Date(v1Deal.Deal_information.Extra_fields.Submission_date_MIN);
  }

  return [
    details,
    hasError,
  ];
};

module.exports = mapDetails;
