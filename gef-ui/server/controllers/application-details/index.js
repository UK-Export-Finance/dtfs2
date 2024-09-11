const startCase = require('lodash/startCase');
const { DEAL_TYPE } = require('@ukef/dtfs2-common');
const api = require('../../services/api');
const { canUpdateUnissuedFacilitiesCheck } = require('./canUpdateUnissuedFacilitiesCheck');
const {
  mapSummaryList,
  displayTaskComments,
  displayChangeSupportingInfo,
  isMIAWithoutChangedToIssuedFacilities,
  returnToMakerNoFacilitiesChanged,
} = require('../../utils/helpers');
const {
  areUnissuedFacilitiesPresent,
  getUnissuedFacilitiesAsArray,
  facilitiesChangedToIssuedAsArray,
  getIssuedFacilitiesAsArray,
  getFacilityCoverStartDate,
  coverDatesConfirmed,
  hasChangedToIssued,
} = require('../../utils/facility-helpers');
const { isUkefReviewAvailable, isUkefReviewPositive, makerCanReSubmit } = require('../../utils/deal-helpers');
const { exporterItems, facilityItems } = require('../../utils/display-items');
const getUserAuthorisationLevelsToApplication = require('../../utils/user-authorisation-level');
const { FACILITY_TYPE, AUTHORISATION_LEVEL, DEAL_STATUS, DEAL_SUBMISSION_TYPE } = require('../../constants');
const Application = require('../../models/application');
const { MAKER } = require('../../constants/roles');

let userSession;

function buildHeader(app) {
  const main = {
    ukefDealId: app.ukefDealId,
    submissionDate: app.submissionDate,
    manualInclusionNoticeSubmissionDate: app?.manualInclusionNoticeSubmissionDate,
    companyName: app.exporter?.companyName,
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
  const ukefReviewAvailable = isUkefReviewAvailable(app.status, app.ukefDecision);
  const ukefReviewPositive = isUkefReviewPositive(app.status, app.ukefDecision);
  const coverDates = coverDatesConfirmed(app.facilities);
  const hasChangedFacilities = hasChangedToIssued(app);
  const unissuedFacilitiesPresent = areUnissuedFacilitiesPresent(app);
  const facilitiesChangedToIssued = facilitiesChangedToIssuedAsArray(app);
  const hasUkefDecisionAccepted = app.ukefDecisionAccepted ? app.ukefDecisionAccepted : false;

  const mapSummaryParams = {
    app,
    user,
    hasChangedFacilities,
  };

  const appBody = {
    application: app,
    status: app.status,
    isAutomaticCover: app.submissionType === DEAL_SUBMISSION_TYPE.AIN,
    exporter: {
      status: app.exporterStatus,
      rows: mapSummaryList(
        { details: app.exporter }, // wrap in details because mapSummaryList relies on this.
        exporterItems(exporterUrl, {
          showIndustryChangeLink: app.exporter?.industries?.length > 1,
          correspondenceAddressLink: !app.exporter.correspondenceAddress,
        }),
        mapSummaryParams,
        previewMode,
      ),
    },
    eligibility: {
      status: app.eligibilityCriteriaStatus,
    },
    facilities: {
      status: app.facilitiesStatus,
      data: app.facilities.items
        .map((item) => ({
          heading: startCase(FACILITY_TYPE[item.details.type.toUpperCase()].toLowerCase()),
          rows: mapSummaryList(item, facilityItems(`${facilityUrl}/${item.details._id}`, item.details, app.version), mapSummaryParams, previewMode),
          createdAt: item.details.createdAt,
          facilityId: item.details._id,
          // facilityName added for aria-label for accessibility
          facilityName: item.details.name,
          // ukefFacilityId required for html facility summary table id
          ukefFacilityId: item.details.ukefFacilityId,
        }))
        .sort((a, b) => b.createdAt - a.createdAt), // latest facility appears at top
    },
    supportingInfo: {
      ...app.supportingInformation,
      status: app.supportingInfoStatus,
    },
    bankInternalRefName: app.bankInternalRefName,
    additionalRefName: app.additionalRefName,
    dealId: app.id,
    makerCanSubmit: app.canSubmit,
    checkerCanSubmit: app.checkerCanSubmit,
    makerCanReSubmit: makerCanReSubmit(userSession, app),
    ukefDecision: app.ukefDecision,
    unissuedFacilitiesPresent,
    facilitiesChangedToIssued,
    isUkefReviewAvailable: ukefReviewAvailable,
    isUkefReviewPositive: ukefReviewPositive,
    ukefDecisionAccepted: hasUkefDecisionAccepted,
    coverDatesConfirmed: coverDates,
    renderReviewDecisionLink: ukefReviewAvailable && ukefReviewPositive && !coverDates && !hasUkefDecisionAccepted && app.userRoles.includes(MAKER),
    previewMode,
    hasChangedFacilities,
    userRoles: app.userRoles,
    displayComments: displayTaskComments(app),
    displayChangeSupportingInfo: displayChangeSupportingInfo(app, previewMode),
    canUpdateUnissuedFacilities: canUpdateUnissuedFacilitiesCheck(app, unissuedFacilitiesPresent, facilitiesChangedToIssued, hasUkefDecisionAccepted),
    MIAReturnToMaker: isMIAWithoutChangedToIssuedFacilities(app),
    returnToMakerNoFacilitiesChanged: returnToMakerNoFacilitiesChanged(app, hasChangedFacilities),
  };

  return appBody;
}

function buildActions(app) {
  return {
    submit: app.canSubmit,
    abandon: app.userRoles?.includes(MAKER) && [DEAL_STATUS.DRAFT, DEAL_STATUS.CHANGES_REQUIRED].includes(app.status),
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
    [DEAL_STATUS.DRAFT]: 'application-details',
    [DEAL_STATUS.CHANGES_REQUIRED]: 'application-details',
    [DEAL_STATUS.READY_FOR_APPROVAL]: 'application-preview',
    [DEAL_STATUS.SUBMITTED_TO_UKEF]: 'application-preview',
    [DEAL_STATUS.ABANDONED]: 'application-preview',
    [DEAL_STATUS.UKEF_ACKNOWLEDGED]: 'application-preview',
    [DEAL_STATUS.IN_PROGRESS_BY_UKEF]: 'application-details',
    [DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS]: 'application-preview',
    [DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS]: 'application-preview',
    [DEAL_STATUS.UKEF_REFUSED]: 'application-preview',
    [DEAL_STATUS.EXPIRED]: '',
    [DEAL_STATUS.WITHDRAWN]: '',
  };

  const partials = {
    'review-decision': 'review-decision',
    'cover-start-date': 'cover-start-date',
    'confirm-cover-start-date': 'confirm-cover-start-date',
    'unissued-facilities': 'unissued-facilities',
  };

  return url in partials ? partials[url] : template[status];
};

const applicationDetails = async (req, res, next) => {
  const {
    params: { dealId, facilityId },
    session: { user, userToken },
  } = req;
  const facilitiesPartials = ['cover-start-date', 'confirm-cover-start-date', 'unissued-facilities'];
  userSession = user;

  let facility;
  let url;
  const link = `/gef/application-details/${dealId}`;

  try {
    const application = await Application.findById(dealId, user, userToken);

    // 404 not found or unauthorised
    if (!application) {
      console.error('Invalid application or access %s', dealId);
      return res.redirect('/dashboard');
    }

    // Ensure application is `GEF` type
    if (application.dealType !== DEAL_TYPE.GEF) {
      console.error('Deal ID %s specified is not a GEF deal', dealId);
      return res.render('partials/problem-with-service.njk');
    }

    const userAuthorisationLevels = getUserAuthorisationLevelsToApplication(user, application);
    const previewMode = !userAuthorisationLevels.includes(AUTHORISATION_LEVEL.EDIT);

    const userRoles = user.roles;

    const applicationWithUserRoles = {
      ...application,
      userRoles,
    };

    if (req.url) {
      url = req.url.split('/');
      url = url[url.length - 1];
    }

    if (facilitiesPartials.includes(url)) {
      if (url === 'cover-start-date') {
        facility = getIssuedFacilitiesAsArray(await api.getFacilities({ dealId, userToken }));
      } else if (url === 'confirm-cover-start-date') {
        facility = getFacilityCoverStartDate(await api.getFacility({ facilityId, userToken }));
      } else if (url === 'unissued-facilities') {
        facility = getUnissuedFacilitiesAsArray(await api.getFacilities({ dealId, userToken }), application);
      }
    }

    const partial = stateToPartial(application.status, url);

    const params = {
      user,
      ...buildView(applicationWithUserRoles, previewMode, user),
      link,
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

    // Using req.flash to pass success message when facility is updated from unissued to issued. More info regarding req.flash can be found here:https://www.npmjs.com/package/connect-flash
    const [successMessage] = req.flash('success');

    if (successMessage) {
      params.success = successMessage;
    }

    if (params.unissuedFacilitiesPresent) {
      params.link += '/unissued-facilities';
    }

    return res.render(`partials/${partial}.njk`, params);
  } catch (error) {
    console.error('Unable to build application view %o', error);
    return next(error);
  }
};

const postApplicationDetails = (req, res) => {
  const { params } = req;
  const { dealId } = params;
  return res.redirect(`/gef/application-details/${dealId}/submit`);
};

module.exports = {
  applicationDetails,
  postApplicationDetails,
};
