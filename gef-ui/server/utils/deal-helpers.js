const CONSTANTS = require('../constants');
const {
  hasChangedToIssued,
  coverDatesConfirmed,
  getIssuedFacilitiesAsArray,
} = require('./facility-helpers');

const status = ({
  [CONSTANTS.DEAL_STATUS.NOT_STARTED]: {
    text: CONSTANTS.DEAL_STATUS.NOT_STARTED,
    class: 'govuk-tag--grey',
    code: CONSTANTS.DEAL_STATUS.NOT_STARTED,
  },
  [CONSTANTS.DEAL_STATUS.IN_PROGRESS]: {
    text: CONSTANTS.DEAL_STATUS.IN_PROGRESS,
    class: 'govuk-tag--blue',
    code: CONSTANTS.DEAL_STATUS.IN_PROGRESS,
  },
  [CONSTANTS.DEAL_STATUS.COMPLETED]: {
    text: CONSTANTS.DEAL_STATUS.COMPLETED,
    class: 'govuk-tag--green',
    code: CONSTANTS.DEAL_STATUS.COMPLETED,
  },
});

const isNotice = (type) => type.toLowerCase().includes('notice');

const isUkefReviewAvailable = (applicationStatus, ukefDecision) => {
  if (ukefDecision?.length > 0) {
    const acceptable = [
      CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS,
      CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS,
      CONSTANTS.DEAL_STATUS.UKEF_REFUSED,
    ];
    return acceptable.includes(applicationStatus) || acceptable.includes(ukefDecision[0].decision);
  }
  return false;
};

const isUkefReviewPositive = (applicationStatus, ukefDecision) => {
  if (ukefDecision?.length > 0) {
    const acceptable = [
      CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS,
      CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS,
    ];
    return acceptable.includes(applicationStatus) || acceptable.includes(ukefDecision[0].decision);
  }
  return false;
};

const makerCanReSubmit = (maker, application) => {
  const acceptableStatus = [
    CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS,
    CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS,
    CONSTANTS.DEAL_STATUS.UKEF_ACKNOWLEDGED,
  ];
  let facilitiesChangedToIssued = true;

  // only if AIN -> ensures a facility has changed to issued before resubmitting to bank
  if (application.status === CONSTANTS.DEAL_STATUS.UKEF_ACKNOWLEDGED) {
    facilitiesChangedToIssued = hasChangedToIssued(application);
  }
  const coverDateConfirmed = getIssuedFacilitiesAsArray(application.facilities).length > 0
    ? coverDatesConfirmed(application.facilities)
    : true;
  const makerAuthorised = (maker.roles.includes('maker') && maker.bank.id === application.bank.id);

  return coverDateConfirmed && facilitiesChangedToIssued && acceptableStatus.includes(application.status) && makerAuthorised;
};

const getApplicationType = (isAutomaticCover) => {
  if (isAutomaticCover === true) {
    return 'Automatic inclusion notice';
  }
  if (isAutomaticCover === false) {
    return 'Manual inclusion notice';
  }
  return 'Unknown';
};

/**
 * If the UKEF Decision has been accepted by the maker then return true
 * else evaluate whether the application is a Notice
 * @param {Boolean} ukefDecisionAccepted application.ukefDecisionAccepted
 * @param {String} submissionType application.submissionType
 * @returns Boolean Boolean value
 */
const isDealNotice = (ukefDecisionAccepted, submissionType) => (ukefDecisionAccepted ? true : isNotice(submissionType));

module.exports = {
  status,
  isNotice,
  isUkefReviewAvailable,
  isUkefReviewPositive,
  makerCanReSubmit,
  getApplicationType,
  isDealNotice,
};
