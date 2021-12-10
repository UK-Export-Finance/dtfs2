/* eslint-disable no-underscore-dangle */
const _startCase = require('lodash/startCase');
const api = require('../../services/api');
const
  {
    mapSummaryList,
    isUkefReviewAvailable,
    isUkefReviewPositive,
    areUnissuedFacilitiesPresent,
    getFacilitiesAsArray,
    getUnissuedFacilitiesAsArray,
    facilitiesChangedToIssuedAsArray,
    getFacilityCoverStartDate,
    coverDatesConfirmed,
    makerCanReSubmit,
    userType,
  } = require('../../utils/helpers');
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

let userSession;

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
    activeSubNavigation: '/',
  };

  let checker = {};

  if (app.checker) {
    checker = {
      checkedBy: `${app.checker.firstname} ${app.checker.surname}`,
    };
  }

  return { ...main, ...checker };
}

function buildBody(app, previewMode, user) {
  const exporterUrl = `/gef/application-details/${app.id}`;
  const facilityUrl = `/gef/application-details/${app.id}/facilities`;

  return {
    application: app,
    status: app.status,
    isAutomaticCover: app.submissionType === DEAL_SUBMISSION_TYPE.AIN,
    exporter: {
      status: app.exporterStatus,
      rows: mapSummaryList(app.exporter, exporterItems(exporterUrl, {
        showIndustryChangeLink: app.exporter.details.industries && app.exporter.details.industries.length > 1,
      }), app, user, previewMode),
    },
    eligibility: {
      status: app.eligibilityCriteriaStatus,
    },
    facilities: {
      status: app.facilitiesStatus,
      data: app.facilities.items.map((item) => ({
        heading: _startCase(FACILITY_TYPE[item.details.type].toLowerCase()),
        rows: mapSummaryList(item, facilityItems(`${facilityUrl}/${item.details._id}`, item.details), app, user, previewMode),
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
    makerCanReSubmit: makerCanReSubmit(userSession, app),
    ukefDecision: app.ukefDecision,
    isUkefReviewAvailable: isUkefReviewAvailable(app.status),
    isUkefReviewPositive: isUkefReviewPositive(app.status),
    unissuedFacilitiesPresent: areUnissuedFacilitiesPresent(app),
    facilitiesChangedToIssued: facilitiesChangedToIssuedAsArray(app),
    ukefDecisionAccepted: app.ukefDecisionAccepted ? app.ukefDecisionAccepted : false,
    coverDatesConfirmed: coverDatesConfirmed(app.facilities),
    previewMode,
    userRoles: app.userRoles,
    userString: userType(user),
  };
}

function buildActions(app) {
  return {
    submit: app.canSubmit,
    abandon: [
      PROGRESS.DRAFT,
      PROGRESS.CHANGES_REQUIRED].includes(app.status.toUpperCase()),
  };
}

function buildView(app, previewMode, user) {
  const header = buildHeader(app);
  const body = buildBody(app, previewMode, user);
  const actions = buildActions(app);
  return { ...header, ...body, ...actions };
}

const stateToPartial = (status, url) => {
  // Behaviour depending on application state
  const template = {
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

  const partials = {
    'review-decision': 'review-decision',
    'cover-start-date': 'cover-start-date',
    'confirm-cover-start-date': 'confirm-cover-start-date',
    'unissued-facilities': 'unissued-facilities',
  };

  return url in partials
    ? partials[url]
    : template[status];
};

const applicationDetails = async (req, res, next) => {
  const {
    params: { applicationId, facilityId },
    session: { user, userToken },
  } = req;
  const facilitiesPartials = [
    'cover-start-date',
    'confirm-cover-start-date',
    'unissued-facilities',
  ];
  userSession = user;

  let facility;
  let url;

  try {
    const application = await Application.findById(applicationId, user, userToken);

    if (!application) {
      // 404 not found or unauthorised
      return res.redirect('/dashboard');
    }
    const userAuthorisationLevels = getUserAuthorisationLevelsToApplication(user, application);
    const previewMode = !userAuthorisationLevels.includes(AUTHORISATION_LEVEL.EDIT);

    const maker = await api.getUserDetails(application.userId, userToken);

    const userRoles = user.roles;

    const applicationWithMaker = {
      ...application,
      maker,
      userRoles,
    };

    if (req.url) {
      url = req.url.split('/');
      url = url[url.length - 1];
    }

    if (facilitiesPartials.includes(url)) {
      if (url === 'cover-start-date') {
        facility = getFacilitiesAsArray(await api.getFacilities(applicationId));
      } else if (url === 'confirm-cover-start-date') {
        facility = getFacilityCoverStartDate(await api.getFacility(facilityId));
      } else if (url === 'unissued-facilities') {
        facility = getUnissuedFacilitiesAsArray(await api.getFacilities(applicationId), application.submissionDate);
      }
    }

    const partial = stateToPartial(application.status, url);

    const params = {
      user,
      ...buildView(applicationWithMaker, previewMode, user),
    };

    if (facility) {
      params.facility = facility;
    }

    if (req.errors) {
      params.errors = req.errors;
    }

    if (req.success) {
      params.success = req.success;
    }

    return res.render(`partials/${partial}.njk`, params);
  } catch (err) {
    console.error('Unable to build application view', { err });
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
