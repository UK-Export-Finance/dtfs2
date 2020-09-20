
const findPortalValue = require('./findPortalValue');

const { getBankByName } = require('../helpers/banks');
const { getUserByEmail } = require('../helpers/users');
const { convertV1Date } = require('../helpers/date-helpers');
const log = require('../helpers/log');
const CONSTANTS = require('../../../deal-api/src/constants');

const mapDetails = (portalDealId, v1Deal) => {
  let hasError = false;

  const logError = (error) => {
    hasError = true;
    log.addError(portalDealId, error);
  };

  const details = {
    bank: v1Deal.Application_bank,
    bankSupplyContractID: v1Deal.General_information.Bank_deal_id,
    bankSupplyContractName: v1Deal.General_information.Deal_name,
    ukefDealId: v1Deal.UKEF_deal_id,
    status: findPortalValue(v1Deal.Deal_information.Extra_fields.Deal_status, 'Deal_status', 'DEAL', 'STATUS', logError),
    previousStatus: findPortalValue(v1Deal.Deal_information.Extra_fields.Deal_previous_status, 'Deal_previous_status', 'DEAL', 'STATUS', logError),
    previousWorkflowStatus: v1Deal.Deal_information.Extra_fields.Deal_previous_status,
    owningBank: getBankByName(v1Deal.Application_bank),
    dateOfLastAction: convertV1Date(v1Deal.Deal_information.Extra_fields.Deal_updated),
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

  const maker = getUserByEmail(makerUsername);
  if (maker.username) {
    details.maker = maker;
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

  const ecAnswer = v1Deal.Eligibility_checklist.Extra_fields.Ec_answers.Ec_answer;

  const isAIN = ecAnswer.filter(({ Answer }) => Answer === 'True').length === ecAnswer.length;
  const isMIA = ecAnswer.filter(({ Answer }) => Answer === 'False').length > 0;
  const isMIN = isMIA && typeof v1Deal.Deal_information.Extra_fields.Submission_date_MIN === 'string';

  if (isMIN) {
    details.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.MIN;
    details.manualInclusionNoticeSubmissionDate = convertV1Date(v1Deal.Deal_information.Extra_fields.Submission_date_MIN);
  } else if (isMIA) {
    details.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.MIA;
  } else if (isAIN) {
    details.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.AIN;
  }

  return [
    details,
    hasError,
  ];
};
/*

    submissionType: 'Manual Inclusion Application',

  }
  */


module.exports = mapDetails;
