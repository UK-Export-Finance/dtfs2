const { decode } = require('html-entities');
const {
  getApplication,
  getEligibilityCriteria,
  getExporter,
  getFacilities,
  getUserDetails,
} = require('../services/api');
const { status } = require('../utils/helpers');
const { PROGRESS, DEAL_SUBMISSION_TYPE } = require('../../constants');

const termToSupportDocuments = {
  coverStart: ['manualInclusion', 'managementAccounts', 'financialStatements', 'financialForecasts', 'financialCommentary', 'corporateStructure', 'debtorAndCreditorReports'],
  noticeDate: ['manualInclusion'],
  facilityLimit: ['manualInclusion', 'managementAccounts', 'financialStatements', 'financialForecasts', 'financialCommentary', 'corporateStructure', 'debtorAndCreditorReports'],
  exporterDeclaration: ['manualInclusion', 'exportLicence'],
  dueDiligence: ['manualInclusion'],
  facilityLetter: ['manualInclusion'],
  facilityBaseCurrency: ['manualInclusion'],
  facilityPaymentCurrency: ['manualInclusion'],
};

const deriveSupportingInfoRequiredDocuments = (application) => {
  let requiredDocs = [];

  Object.keys(termToSupportDocuments).forEach((term) => {
    const answerObj = application.eligibilityCriteria.answers.find((a) => a.name === term);

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
    if (availableField) availableFields.push(requiredField);
  });

  let state = PROGRESS.NOT_STARTED;
  state = availableFields.length === requiredFields.length ? PROGRESS.COMPLETED : state;
  state = availableFields.length < requiredFields.length ? PROGRESS.IN_PROGRESS : state;
  state = availableFields.length === 0 ? PROGRESS.NOT_STARTED : state;

  return status[state];
};

class Application {
  static async findById(id, user, userToken) {
    try {
      const application = await getApplication(id);
      if (application.bankId !== user.bank.id) {
        return null;
      }

      application.id = id;

      const exporterPro = getExporter(application.exporterId);
      const facilitiesPro = getFacilities(id);
      const eligibilityCriteriaPro = getEligibilityCriteria();

      let eligibilityCriteriaContent;

      const all = await Promise.all([exporterPro, facilitiesPro, eligibilityCriteriaPro]);
      [application.exporter, application.facilities, eligibilityCriteriaContent] = [...all];

      application.exporterStatus = status[application.exporter.status || PROGRESS.NOT_STARTED];
      application.eligibilityCriteriaStatus = status[application.eligibilityCriteria.status || PROGRESS.NOT_STARTED];
      application.facilitiesStatus = status[application.facilities.status || PROGRESS.NOT_STARTED];
      if (application.supportingInformation) {
        application.supportingInfoStatus = deriveSupportingInfoStatus(application);
        application.supportingInformation.requiredFields = deriveSupportingInfoRequiredDocuments(application);
      } else {
        application.supportingInfoStatus = status[PROGRESS.NOT_STARTED];
      }

      // Can only submit when all section statuses are set to complete
      // and the application is in Draft or CHANGES_REQUIRED
      application.canSubmit = application.exporterStatus.code === PROGRESS.COMPLETED
        && application.eligibilityCriteriaStatus.code === PROGRESS.COMPLETED
        && application.facilitiesStatus.code === PROGRESS.COMPLETED
        && (
          application.submissionType === DEAL_SUBMISSION_TYPE.AIN
          || application.supportingInfoStatus.code === PROGRESS.COMPLETED
        )
        && [PROGRESS.DRAFT, PROGRESS.CHANGES_REQUIRED].includes(application.status)
        && user.roles.includes('maker');

      application.checkerCanSubmit = ['BANK_CHECK'].includes(application.status)
        && user._id !== application.userId // The checker is not the maker
        && user.roles.includes('checker');

      if (![PROGRESS.DRAFT].includes(application.status)) {
        application.maker = await getUserDetails(application.userId, userToken);
      }
      if (application.checkerId) {
        application.checker = await getUserDetails(application.checkerId, userToken);
      }

      application.eligibilityCriteria.answers = application.eligibilityCriteria.answers.map((answer) => {
        const contentObj = eligibilityCriteriaContent.terms.find((term) => term.id === answer.id);
        return {
          ...answer,
          description: decode(contentObj.htmlText),
          descriptionList: [],
        };
      });

      return application;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      throw err;
    }
  }
}

module.exports = Application;
