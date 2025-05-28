const startCase = require('lodash/startCase');
const { DEAL_TYPE, timeZoneConfig, DEAL_STATUS, PORTAL_AMENDMENT_INPROGRESS_STATUSES } = require('@ukef/dtfs2-common');
const { getTfmDeal, getAmendmentsOnDeal, getFacilities, getFacility } = require('../../services/api');
const { canIssueUnissuedFacilities } = require('./canIssueUnissuedFacilities');
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
  canResubmitIssuedFacilities,
  getIssuedFacilitiesAsArray,
  getFacilityCoverStartDate,
  coverDatesConfirmed,
  isFacilityResubmissionAvailable,
} = require('../../utils/facility-helpers');
const { isUkefReviewAvailable, isUkefReviewPositive, makerCanReSubmit } = require('../../utils/deal-helpers');
const { exporterItems, facilityItems } = require('../../utils/display-items');
const getUserAuthorisationLevelsToApplication = require('../../utils/user-authorisation-level');
const { FACILITY_TYPE, AUTHORISATION_LEVEL, DEAL_SUBMISSION_TYPE, STAGE } = require('../../constants');
const Application = require('../../models/application');
const { MAKER } = require('../../constants/roles');
const { canUserAmendIssuedFacilities } = require('../../utils/facility-amendments.helper');
const { getSubmittedAmendmentDetails } = require('../../utils/submitted-amendment-details');

let userSession;
let apiToken;

function buildHeader(app) {
  const main = {
    ukefDealId: app.ukefDealId,
    submissionDate: app.submissionDate,
    manualInclusionNoticeSubmissionDate: app?.manualInclusionNoticeSubmissionDate,
    companyName: app.exporter?.companyName,
    applicationStatus: app.status,
    dateCreated: app.createdAt,
    timezone: app.maker.timezone || timeZoneConfig.DEFAULT,
    createdBy: `${app.maker.firstname} ${app.maker.surname}`,
    comments: app.comments,
    applicationType: app.submissionType,
    submissionCount: app.submissionCount,
    activeSubNavigation: '/',
    portalAmendmentStatus: app.portalAmendmentStatus,
    isPortalAmendmentInProgress: app.isPortalAmendmentInProgress,
  };

  let checker = {};

  if (app.checker) {
    checker = {
      checkedBy: `${app.checker.firstname} ${app.checker.surname}`,
    };
  }

  return { ...main, ...checker };
}

/**
 * Builds the application body object for rendering application details.
 *
 * @async
 * @function buildBody
 * @param {Object} app - The application object containing all deal and facility data.
 * @param {boolean} previewMode - Indicates if the application is in preview mode.
 * @param {Object} user - The user object representing the current user.
 * @returns {Promise<Object>} The constructed application body object with all relevant details for rendering.
 */
const buildBody = async (app, previewMode, user) => {
  const exporterUrl = `/gef/application-details/${app._id}`;
  const facilityUrl = `/gef/application-details/${app._id}/facilities`;
  const ukefReviewAvailable = isUkefReviewAvailable(app.status, app.ukefDecision);
  const ukefReviewPositive = isUkefReviewPositive(app.status, app.ukefDecision);
  const coverDates = coverDatesConfirmed(app.facilities);
  const hasChangedFacilities = isFacilityResubmissionAvailable(app);
  const unissuedFacilitiesPresent = areUnissuedFacilitiesPresent(app);
  const canResubmitIssueFacilities = canResubmitIssuedFacilities(app);
  const hasUkefDecisionAccepted = app.ukefDecisionAccepted ? app.ukefDecisionAccepted : false;
  const dealCancelledStatus = [DEAL_STATUS.CANCELLED, DEAL_STATUS.PENDING_CANCELLATION];
  const tfmDeal = await getTfmDeal({ dealId: app._id, userToken: apiToken });

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
          stage: item.details?.facilityStage ?? (item.details.hasBeenIssued ? STAGE.ISSUED : STAGE.UNISSUED),
          // isFacilityWithAmendmentInProgress required for html. A link see details will appear to the user for facility with amendment in progress
          isFacilityWithAmendmentInProgress: item.details._id === app.facilityIdWithAmendmentInProgress,
        }))
        .sort((a, b) => b.createdAt - a.createdAt), // latest facility appears at top
    },
    supportingInfo: {
      ...app.supportingInformation,
      status: app.supportingInfoStatus,
    },
    bankInternalRefName: app.bankInternalRefName,
    additionalRefName: app.additionalRefName,
    dealId: app._id,
    makerCanSubmit: app.canSubmit,
    checkerCanSubmit: app.checkerCanSubmit,
    makerCanReSubmit: makerCanReSubmit(userSession, app),
    ukefDecision: app.ukefDecision,
    unissuedFacilitiesPresent,
    canResubmitIssueFacilities: canResubmitIssueFacilities.length,
    resubmitIssuedFacilities: canResubmitIssueFacilities,
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
    canIssueFacilities: canIssueUnissuedFacilities({
      portalDeal: app,
      tfmDeal,
      unissuedFacilitiesPresent,
      canResubmitIssueFacilities,
      hasUkefDecisionAccepted,
    }),
    MIAReturnToMaker: isMIAWithoutChangedToIssuedFacilities(app),
    returnToMakerNoFacilitiesChanged: returnToMakerNoFacilitiesChanged(app, hasChangedFacilities),
    canCloneDeal: !dealCancelledStatus.includes(app.status),
  };

  return appBody;
};

/**
 * Builds an object representing available actions for a given application.
 *
 * @param {Object} app - The application object.
 * @param {boolean} app.canSubmit - Indicates if the application can be submitted.
 * @param {string[]} [app.userRoles] - Array of user roles associated with the application.
 * @param {string} app.status - Current status of the application.
 * @returns {Object} Actions object with boolean flags for each action.
 * @returns {boolean} return.submit - Whether the submit action is available.
 * @returns {boolean} return.abandon - Whether the abandon action is available.
 */
const buildActions = (app) => {
  return {
    submit: app.canSubmit,
    abandon: app.userRoles?.includes(MAKER) && [DEAL_STATUS.DRAFT, DEAL_STATUS.CHANGES_REQUIRED].includes(app.status),
  };
};

/**
 * Builds the view object for an application, combining header, body, and actions.
 *
 * @async
 * @function
 * @param {Object} app - The application data object.
 * @param {boolean} previewMode - Flag indicating if the view is in preview mode.
 * @param {Object} user - The user object requesting the view.
 * @returns {Promise<Object>} The combined view object containing header, body, and actions.
 */
const buildView = async (app, previewMode, user) => {
  const header = buildHeader(app);
  const body = await buildBody(app, previewMode, user);
  const actions = buildActions(app);

  return { ...header, ...body, ...actions };
};

/**
 * Determines the appropriate partial template to render based on the application's status and the current URL.
 *
 * @param {string} status - The current status of the application, expected to be a value from DEAL_STATUS.
 * @param {string} url - The current URL or route segment, used to override the template in specific cases.
 * @returns {string|undefined} The name of the partial template to render, or an empty string if none applies.
 */
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
    [DEAL_STATUS.CANCELLED]: 'application-preview',
    [DEAL_STATUS.PENDING_CANCELLATION]: 'application-preview',
  };

  const partials = {
    'review-decision': 'review-decision',
    'cover-start-date': 'cover-start-date',
    'confirm-cover-start-date': 'confirm-cover-start-date',
    'unissued-facilities': 'unissued-facilities',
  };

  return url in partials ? partials[url] : template[status];
};

/**
 * Controller for handling the application details page.
 *
 * Retrieves application and facility details, checks user authorisation, determines the appropriate view and partial to render,
 * and passes relevant data to the template. Handles special cases for facility-related partials and manages success/error messages.
 *
 * @async
 * @function applicationDetails
 * @param {import('express').Request} req - Express request object, containing route params, session, and flash messages.
 * @param {import('express').Response} res - Express response object, used to render views or redirect.
 * @param {import('express').NextFunction} next - Express next middleware function, called on error.
 * @returns {Promise<void>} Renders the appropriate application details view or redirects on error/unauthorised access.
 */
const applicationDetails = async (req, res, next) => {
  const {
    params: { dealId, facilityId },
    session: { user, userToken },
  } = req;
  const facilitiesPartials = ['cover-start-date', 'confirm-cover-start-date', 'unissued-facilities'];

  userSession = user;
  apiToken = userToken;

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
    const amendmentDetails = await getSubmittedAmendmentDetails(application, userToken);
    const applicationData = {
      ...application,
      ...amendmentDetails,
      userRoles,
    };

    if (req.url) {
      url = req.url.split('/');
      url = url[url.length - 1];
    }

    if (facilitiesPartials.includes(url)) {
      if (url === 'cover-start-date') {
        facility = getIssuedFacilitiesAsArray(await getFacilities({ dealId, userToken }));
      } else if (url === 'confirm-cover-start-date') {
        facility = getFacilityCoverStartDate(await getFacility({ facilityId, userToken }));
      } else if (url === 'unissued-facilities') {
        facility = getUnissuedFacilitiesAsArray(await getFacilities({ dealId, userToken }), application);
      }
    }

    const partial = stateToPartial(application.status, url);
    const view = await buildView(applicationData, previewMode, user);

    const params = {
      user,
      ...view,
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

    const amendmentsUnderwayOnDeal = await getAmendmentsOnDeal({ dealId, statuses: PORTAL_AMENDMENT_INPROGRESS_STATUSES, userToken });

    params.canIssuedFacilitiesBeAmended =
      canUserAmendIssuedFacilities(application.submissionType, application.status, userRoles) && !amendmentsUnderwayOnDeal.length;

    return res.render(`partials/${partial}.njk`, params);
  } catch (error) {
    console.error('Unable to build application view %o', error);
    return next(error);
  }
};

/**
 * Handles POST requests for application details.
 * Redirects the user to the submit page for the specified deal.
 *
 * @param {import('express').Request} req - Express request object, containing route parameters.
 * @param {import('express').Response} res - Express response object, used to redirect the client.
 * @returns {void}
 */
const postApplicationDetails = (req, res) => {
  const { params } = req;
  const { dealId } = params;

  return res.redirect(`/gef/application-details/${dealId}/submit`);
};

module.exports = {
  applicationDetails,
  postApplicationDetails,
};
