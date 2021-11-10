/* eslint-disable no-underscore-dangle */
const _startCase = require('lodash/startCase');
const api = require('../../services/api');
const { mapSummaryList } = require('../../utils/helpers');
const {
  exporterItems, facilityItems,
} = require('../../utils/display-items');
const getUserAuthorisationLevelsToApplication = require('../../utils/user-authorisation-level');
const {
  FACILITY_TYPE,
  AUTHORISATION_LEVEL,
  PROGRESS,
  DEAL_SUBMISSION_TYPE,
} = require('../../../constants');

const Application = require('../../models/application');

function buildHeader(app) {
  const main = {
    ukefDealId: app.ukefDealId,
    submissionDate: app.submissionDate,
    companyName: app.exporter.details.companyName,
    applicationStatus: app.status,
    dateCreated: app.createdAt,
    timezone: app.maker.timezone || 'Europe/London',
    createdBy: `${app.maker.firstname} ${app.maker.surname}`,
    comments: app.comments,
    applicationType: app.submissionType,
    submissionCount: app.submissionCount,
  };

  let checker = {};

  if (app.checker) {
    checker = {
      checkedBy: `${app.checker.firstname} ${app.checker.surname}`,
    };
  }

  return { ...main, ...checker };
}

function buildBody(app, previewMode) {
  const exporterUrl = `/gef/application-details/${app.id}`;
  const facilityUrl = `/gef/application-details/${app.id}/facilities`;

  return {
    application: app,
    isAutomaticCover: app.submissionType === DEAL_SUBMISSION_TYPE.AIN,
    exporter: {
      status: app.exporterStatus,
      rows: mapSummaryList(app.exporter, exporterItems(exporterUrl, {
        showIndustryChangeLink: app.exporter.details.industries && app.exporter.details.industries.length > 1,
      }), previewMode),
    },
    eligibility: {
      status: app.eligibilityCriteriaStatus,
    },
    facilities: {
      status: app.facilitiesStatus,
      data: app.facilities.items.map((item) => ({
        heading: _startCase(FACILITY_TYPE[item.details.type].toLowerCase()),
        rows: mapSummaryList(item, facilityItems(`${facilityUrl}/${item.details._id}`, item.details), previewMode),
        createdAt: item.details.createdAt,
        facilityId: item.details._id,
      }))
        .sort((a, b) => b.createdAt - a.createdAt), // latest facility appears at top
    },
    supportingInfo: {
      ...app.supportingInformation,
      status: app.supportingInfoStatus,
    },
    bankInternalRefName: app.bankInternalRefName,
    additionalRefName: app.additionalRefName,
    applicationId: app.id,
    makerCanSubmit: app.canSubmit,
    checkerCanSubmit: app.checkerCanSubmit,
    ukefDecision: app.ukefDecision,
    previewMode,
  };
}

function buildActions(app) {
  return {
    submit: app.canSubmit,
    abandon: [
      PROGRESS.DRAFT,
      PROGRESS.CHANGES_REQUIRED,
      PROGRESS.BANK_CHECK].includes(app.status.toUpperCase()),
  };
}

function buildView(app, previewMode) {
  const header = buildHeader(app);
  const body = buildBody(app, previewMode);
  const actions = buildActions(app);
  return { ...header, ...body, ...actions };
}

const applicationDetails = async (req, res, next) => {
  const {
    params: { applicationId },
    session: { user, userToken },
  } = req;
  try {
    const application = await Application.findById(applicationId, user, userToken);
    if (!application) {
      // 404 not found or unauthorised
      return res.redirect('/dashboard');
    }
    const userAuthorisationLevels = getUserAuthorisationLevelsToApplication(user, application);
    const previewMode = !userAuthorisationLevels.includes(AUTHORISATION_LEVEL.EDIT);

    const maker = await api.getUserDetails(application.userId, userToken);

    const applicationWithMaker = {
      ...application,
      maker,
    };

    // Behaviour depending on application state
    const stateToPartial = {
      DRAFT: 'application-details',
      CHANGES_REQUIRED: 'application-details',
      BANK_CHECK: 'application-preview',
      SUBMITTED_TO_UKEF: 'application-preview',
      ABANDONED: 'application-preview',
      UKEF_ACKNOWLEDGED: 'application-preview',
      UKEF_IN_PROGRESS: 'application-details',
      UKEF_APPROVED_WITHOUT_CONDITIONS: 'application-preview',
      UKEF_APPROVED_WITH_CONDITIONS: 'application-preview',
      UKEF_REFUSED: 'application-preview',
      EXPIRED: '',
      WITHDRAWN: '',
    };
    const partial = stateToPartial[application.status];
    return res.render(`partials/${partial}.njk`, {
      user,
      ...buildView(applicationWithMaker, previewMode),
    });
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

const postApplicationDetails = (req, res) => {
  const { params } = req;
  const { applicationId } = params;
  return res.redirect(`/gef/application-details/${applicationId}/submit`);
};

module.exports = {
  applicationDetails,
  postApplicationDetails,
};
