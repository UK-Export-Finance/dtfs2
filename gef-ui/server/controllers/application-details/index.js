/* eslint-disable no-underscore-dangle */
const _startCase = require('lodash/startCase');
const { mapSummaryList } = require('../../utils/helpers');
const {
  exporterItems, coverItems, facilityItems,
} = require('../../utils/display-items');
const getUserAuthorisationLevelsToApplication = require('../../utils/user-authorisation-level');
const { FACILITY_TYPE, AUTHORISATION_LEVEL, PROGRESS } = require('../../../constants');

const Application = require('../../models/application');

function buildHeader(app) {
  if (!['DRAFT'].includes(app.status)) {
    const main = {
      ukefDealId: app.ukefDealId || '-',
      submissionDate: app.submissionDate || '-',
      companyName: app.exporter.details.companyName,
      applicationShowSummary: [
        PROGRESS.SUBMITTED_TO_UKEF,
        PROGRESS.CHANGES_REQUIRED,
        PROGRESS.BANK_CHECK].includes(app.status),
      applicationStatus: app.status,
      dateCreated: app.createdAt,
      timezone: app.maker.timezone || 'Europe/London',
      createdBy: `${app.maker.firstname} ${app.maker.surname}`,
      comments: app.comments,
      applicationType: app.submissionType,
    };
    let checker = {};
    if (app.checker) {
      checker = {
        checkedBy: `${app.checker.firstname} ${app.checker.surname}`,
      };
    }
    return { ...main, ...checker };
  }
  return {};
}

function buildBody(app, previewMode) {
  const exporterUrl = `/gef/application-details/${app.id}`;
  const coverUrl = `/gef/application-details/${app.id}/automatic-cover`;
  const facilityUrl = `/gef/application-details/${app.id}/facilities`;

  console.log('YOOOO app \n', app);
  return {
    application: app,
    isAutomaticCover: app.eligibilityCriteria.isAutomaticCover,
    exporter: {
      status: app.exporterStatus,
      rows: mapSummaryList(app.exporter, exporterItems(exporterUrl, {
        showIndustryChangeLink: app.exporter.details.industries && app.exporter.details.industries.length > 1,
      }), previewMode),
    },
    coverTerms: {
      status: app.eligibilityCriteriaStatus,
      // rows: mapSummaryList(app.eligibilityCriteria, coverItems(coverUrl), previewMode),
      rows: [],
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
    params,
    session,
  } = req;
  const { applicationId } = params;
  const { user, userToken } = session;
  try {
    const application = await Application.findById(applicationId, user, userToken);
    if (!application) {
      // 404 not found or unauthorised
      return res.redirect('/dashboard');
    }
    const userAuthorisationLevels = getUserAuthorisationLevelsToApplication(user, application);
    const previewMode = !userAuthorisationLevels.includes(AUTHORISATION_LEVEL.EDIT);
    // Behaviour depending on application state
    const stateToPartial = {
      CHANGES_REQUIRED: 'application-details',
      DRAFT: 'application-details',
      BANK_CHECK: 'application-preview',
      SUBMITTED_TO_UKEF: 'application-preview',
      ABANDONED: 'application-preview',
      UKEF_ACKNOWLEDGED: '',
      UKEF_IN_PROGRESS: '',
      UKEF_ACCEPTED_CONDITIONAL: '',
      UKEF_ACCEPTED_UNCONDITIONAL: '',
      UKEF_DECLINED: '',
      EXPIRED: '',
      WITHDRAWN: '',
    };
    const partial = stateToPartial[application.status];
    return res.render(`partials/${partial}.njk`, { user, ...buildView(application, previewMode) });
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
