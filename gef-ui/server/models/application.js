const { getApplication, getFacilities, getUserDetails } = require('../services/api');
const { status } = require('../utils/deal-helpers');
const { facilitiesChangedToIssuedAsArray } = require('../utils/facility-helpers');
const { DEAL_STATUS, DEAL_SUBMISSION_TYPE } = require('../constants');
const { MAKER, CHECKER, ADMIN, READ_ONLY } = require('../constants/roles');

const termToSupportDocuments = {
  coverStart: [
    'manualInclusion',
    'yearToDateManagement',
    'auditedFinancialStatements',
    'financialForecasts',
    'financialInformationCommentary',
    'corporateStructure',
    'debtorAndCreditorReports',
  ],
  noticeDate: ['manualInclusion'],
  facilityLimit: [
    'manualInclusion',
    'yearToDateManagement',
    'auditedFinancialStatements',
    'financialForecasts',
    'financialInformationCommentary',
    'corporateStructure',
    'debtorAndCreditorReports',
  ],
  exporterDeclaration: ['manualInclusion'],
  dueDiligence: ['manualInclusion'],
  revenueThreshold: ['manualInclusion'],
  facilityLetter: ['manualInclusion'],
  facilityBaseCurrency: ['manualInclusion'],
  facilityPaymentCurrency: ['manualInclusion'],
  additionalFacility: ['manualInclusion'],
};

const deriveSupportingInfoRequiredDocuments = (application) => {
  let requiredDocs = [];

  Object.keys(termToSupportDocuments).forEach((term) => {
    const answerObj = application.eligibility.criteria.find((a) => a.name === term);

    let criterionAnswer;
    if (answerObj) {
      criterionAnswer = answerObj.answer;
    }

    if (criterionAnswer === false) {
      requiredDocs = requiredDocs.concat(termToSupportDocuments[term]);
    }
  });

  return [...new Set(requiredDocs)];
};

const deriveSupportingInfoStatus = (application) => {
  const requiredFields = ['securityDetails'].concat(deriveSupportingInfoRequiredDocuments(application));
  const availableFields = [];

  requiredFields.forEach((requiredField) => {
    const availableField = application.supportingInformation[requiredField];

    // eslint-disable-next-line no-prototype-builtins
    if (availableField?.length || availableField?.hasOwnProperty('exporter')) {
      availableFields.push(requiredField);
    }
  });

  let state = DEAL_STATUS.NOT_STARTED;
  state = availableFields.length === requiredFields.length ? DEAL_STATUS.COMPLETED : state;
  state = availableFields.length < requiredFields.length ? DEAL_STATUS.IN_PROGRESS : state;
  state = availableFields.length === 0 ? DEAL_STATUS.NOT_STARTED : state;

  return status[state];
};

// checks if application is a notice and has a submission count above 0
const isNoticeAndCanResubmit = (application) =>
  (application.submissionType === DEAL_SUBMISSION_TYPE.AIN || application.submissionType === DEAL_SUBMISSION_TYPE.MIN) && application.submissionCount > 0;

/**
 * hides submit button if notice and returning to maker if no changes on application and is second/third etc submission
 * checks if AIN or MIN (notice)
 * checks submission count is above 0
 * checks status is changes required and if any facilities have been issued
 * checks facilities have been completed
 */
const applicationCanResubmitAsNotice = (application) =>
  (application.submissionType === DEAL_SUBMISSION_TYPE.AIN || application.submissionType === DEAL_SUBMISSION_TYPE.MIN) &&
  application.submissionCount > 0 &&
  [DEAL_STATUS.CHANGES_REQUIRED].includes(application.status) &&
  facilitiesChangedToIssuedAsArray(application).length > 0 &&
  application.facilitiesStatus.code === DEAL_STATUS.COMPLETED;

// Can only submit when all section statuses are set to complete
// and the application is in Draft or CHANGES_REQUIRED
const canSubmitApplication = (application, user) =>
  application.exporterStatus.code === DEAL_STATUS.COMPLETED &&
  application.eligibilityCriteriaStatus.code === DEAL_STATUS.COMPLETED &&
  application.facilitiesStatus.code === DEAL_STATUS.COMPLETED &&
  (application.submissionType === DEAL_SUBMISSION_TYPE.AIN || application.supportingInfoStatus.code === DEAL_STATUS.COMPLETED) &&
  [DEAL_STATUS.DRAFT, DEAL_STATUS.CHANGES_REQUIRED].includes(application.status) &&
  user.roles.includes(MAKER);

class Application {
  static async findById(id, user, userToken) {
    try {
      const application = await getApplication({ dealId: id, userToken });
      const validRolesForAccessingAllBanks = [ADMIN, READ_ONLY];

      /**
       * Deny access to the application if:
       * 1. Application bank ID does not match with the logged-in user bank ID.
       * 2. Logged-in user role is neither `admin` nor `read-only`.
       */
      if (application.bank.id !== user.bank.id && !validRolesForAccessingAllBanks.some((validRole) => user.roles.includes(validRole))) {
        return null;
      }

      application.id = id;
      application.facilities = await getFacilities({ dealId: id, userToken });

      application.exporterStatus = status[application.exporter.status || DEAL_STATUS.NOT_STARTED];

      application.eligibilityCriteriaStatus = status[application.eligibility.status || DEAL_STATUS.NOT_STARTED];
      application.facilitiesStatus = status[application.facilities.status || DEAL_STATUS.NOT_STARTED];
      if (application.supportingInformation) {
        application.supportingInfoStatus = deriveSupportingInfoStatus(application);
        application.supportingInformation.requiredFields = deriveSupportingInfoRequiredDocuments(application);
      } else {
        application.supportingInfoStatus = status[DEAL_STATUS.NOT_STARTED];
      }

      // sets canSubmit
      if (isNoticeAndCanResubmit(application)) {
        application.canSubmit = applicationCanResubmitAsNotice(application);
      } else {
        application.canSubmit = canSubmitApplication(application, user);
      }

      application.checkerCanSubmit =
        [DEAL_STATUS.READY_FOR_APPROVAL].includes(application.status) && !application.editedBy.includes(user._id) && user.roles.includes(CHECKER);

      if (application.checkerId) {
        application.checker = await getUserDetails({ userId: application.checkerId, userToken });
      }

      return application;
    } catch (error) {
      console.error('Error with GEF application model %o', error);
      throw error;
    }
  }
}

module.exports = Application;
