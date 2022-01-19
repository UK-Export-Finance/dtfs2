
const findPortalValue = require('./findPortalValue');

const { getBankByName } = require('../helpers/banks');
const { getUserByEmail } = require('../helpers/users');
const { convertV1Date } = require('../helpers/date-helpers');
const formatUkefId = require('../helpers/formatUkefId');
const log = require('../helpers/log');
const CONSTANTS = require('../../../portal-api/src/constants');

const mapDetails = (portalDealId, v1Deal) => {
  let hasError = false;

  const logError = (error) => {
    hasError = true;
    log.addError(portalDealId, error);
  };

  const previousStatus = v1Deal.Deal_information.Extra_fields.Deal_previous_status === 'confirmed_by_bank'
    ? 'submitted'
    : v1Deal.Deal_information.Extra_fields.Deal_previous_status;

  const details = {
    ukefDealId: formatUkefId(v1Deal.UKEF_deal_id),
    status: findPortalValue(v1Deal.Deal_information.Extra_fields.Deal_status, 'Deal_status', 'DEAL', 'STATUS', logError),
    previousStatus: findPortalValue(previousStatus, 'Deal_previous_status', 'DEAL', 'STATUS', logError),
    owningBank: getBankByName(v1Deal.Application_bank),
    created: convertV1Date(v1Deal.Deal_information.Extra_fields.Deal_created),
  };


  if (v1Deal.Deal_information.Extra_fields.MIN_Checker.username) {
    const checkerMIN = getUserByEmail(v1Deal.Deal_information.Extra_fields.MIN_Checker.username);
    if (checkerMIN.username) {
      details.checkerMIN = checkerMIN;
    } else {
      logError(`no corresponding checkerMIN for v1 user ${v1Deal.Deal_information.Extra_fields.MIN_Checker.username}`);
    }
  }

  const makerUsername = Array.isArray(v1Deal.Deal_information.Extra_fields.All_Makers.Maker)
    ? v1Deal.Deal_information.Extra_fields.All_Makers.Maker[0].username
    : v1Deal.Deal_information.Extra_fields.All_Makers.Maker.username;

  const minUsername = v1Deal.Deal_information.Extra_fields.MIN_Maker.username;

  const maker = minUsername ? getUserByEmail(minUsername) : getUserByEmail(makerUsername);

  if (maker.username) {
    maker = maker;
  } else {
    hasError = true;
    logError(`maker username not found ${makerUsername}`);
  }


  if (v1Deal.Deal_information.Extra_fields.First_Checker) {
    const checker = getUserByEmail(v1Deal.Deal_information.Extra_fields.First_Checker.username);
    if (checker.username) {
      details.checker = checker;
    } else {
      logError(`checker username not found ${v1Deal.Deal_information.Extra_fields.First_Checker.username}`);
    }
  }


  const submissionDate = v1Deal.Deal_information.Extra_fields.Submission_date_AIN_and_MIA;
  if (submissionDate) {
    details.submissionDate = convertV1Date(submissionDate);
  }

  const applicationRoute = v1Deal.Application_route;

  submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.AIN;

  if (applicationRoute === 'ATP') {
    const statusToCompare = ['ready_for_approval', 'further_input_required'].includes(v1Deal.Deal_information.Extra_fields.Deal_status)
      ? v1Deal.Deal_information.Extra_fields.Deal_previous_status
      : v1Deal.Deal_information.Extra_fields.Deal_status;

    submissionType = ['confirmed_by_bank', 'confirmation_acknowledged'].includes(statusToCompare)
      ? CONSTANTS.DEAL.SUBMISSION_TYPE.MIN
      : CONSTANTS.DEAL.SUBMISSION_TYPE.MIA;
  }

  if (submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIA) {
    details.manualInclusionApplicationSubmissionDate = convertV1Date(submissionDate);
  }

  if (submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIN) {
    details.manualInclusionNoticeSubmissionDate = convertV1Date(v1Deal.Deal_information.Extra_fields.Submission_date_MIN);
  }

  return [
    details,
    hasError,
  ];
};

module.exports = mapDetails;
