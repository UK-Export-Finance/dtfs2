const { FACILITY_PROVIDED_DETAILS, DEAL_STATUS } = require('@ukef/dtfs2-common');
const httpError = require('http-errors');
const lodashIsEmpty = require('lodash/isEmpty');
const commaNumber = require('comma-number');
const cleanDeep = require('clean-deep');
const { format } = require('date-fns');
const CONSTANTS = require('../constants');

const ACTION_TEXT = {
  CHANGE: 'Change',
  ADD: 'Add',
};

const {
  canResubmitIssuedFacilities,
  summaryIssuedChangedToIssued,
  summaryIssuedUnchanged,
  areUnissuedFacilitiesPresent,
  isFacilityResubmissionAvailable,
  isFacilityAmendmentInProgress,
} = require('./facility-helpers');

const { isUkefReviewAvailable } = require('./deal-helpers');
const { MAKER } = require('../constants/roles');

const userToken = (req) => {
  const token = req.session.userToken;
  return token;
};

// Checks to see if an element is an object or not
const isObject = (el) => typeof el === 'object' && el !== null && !(el instanceof Array);

const isMIAWithoutChangedToIssuedFacilities = (app) =>
  app.status === DEAL_STATUS.CHANGES_REQUIRED && app.submissionType === CONSTANTS.DEAL_SUBMISSION_TYPE.MIA && app.submissionCount > 0;

// Converts Api errors into more manageable objects
const apiErrorHandler = ({ code, response }) => {
  console.error('API error %s %o', code, response);

  if (code === 'ECONNABORTED') {
    throw httpError(501, 'Request timed out.');
  }
  // Is validation error
  if (response?.status === 422 || response?.status === 400) {
    return response;
  }

  throw httpError(response.status, response.statusText);
};

const ErrorMessagesMap = {
  bankInternalRefName: {
    MANDATORY_FIELD: 'Application reference name is mandatory',
    FIELD_TOO_LONG: 'Application reference name can only be up to 30 characters in length',
    FIELD_INVALID_CHARACTERS:
      'Application reference must only include letters a to z, full stops, commas, colons, semi-colons, hyphens, spaces and apostrophes”',
  },
  additionalRefName: {
    MANDATORY_FIELD: 'Additional reference name is mandatory',
    FIELD_TOO_LONG: 'Additional reference name can only be up to 30 characters in length',
    FIELD_INVALID_CHARACTERS:
      'Additional reference name must only include letters a to z, full stops, commas, colons, semi-colons, hyphens, spaces and apostrophes”',
  },
};

/**
 * Maps validation errors so both Summary Error component and field component display the error messages correctly.
 * @param {import('../types/validation-error').ValidationError[] | import('../types/validation-error').ValidationError} errs - errors to be mapped
 * @param {string} href - the current page URL
 * @returns {import('../types/view-models/view-model-errors').ViewModelErrors | null}
 */
const validationErrorHandler = (errs, href = '') => {
  const errorSummary = [];
  const fieldErrors = {};

  if (!errs) {
    return null;
  }

  const errors = Array.isArray(errs) ? errs : [errs];

  errors.forEach((el) => {
    const errorsForReference = ErrorMessagesMap[el.errRef];
    const mappedErrorMessage = errorsForReference ? errorsForReference[el.errCode] : el.errMsg;

    errorSummary.push({
      text: mappedErrorMessage,
      href: `${href}#${el.errRef}`,
    });
    fieldErrors[el.errRef] = {
      text: mappedErrorMessage,
    };
    if (el.subFieldErrorRefs) {
      el.subFieldErrorRefs.forEach((subFieldRef) => {
        fieldErrors[subFieldRef] = {
          text: mappedErrorMessage,
        };
      });
    }
  });

  return {
    errorSummary,
    fieldErrors,
  };
};

/* Clean-Deep removes any properties with Null value from an Object. Therefore if all
  properties are Null, this leaves us with an Empty Object. isEmpty checks to see if the
  Object is empty or not. */
const isEmpty = (value) => lodashIsEmpty(cleanDeep(value));

// for which rows in the facility tables should show change when facilities changed to issued post submission
const calculateShouldDisplayChangeLinkOnceIssued = (id) => {
  const fieldsThatAllowChangeLink = [
    'name',
    'coverStartDate',
    'coverEndDate',
    'issueDate',
    'hasBeenIssued',
    'isUsingFacilityEndDate',
    'facilityEndDate',
    'bankReviewDate',
  ];
  return fieldsThatAllowChangeLink.includes(id);
};

const returnToMakerNoFacilitiesChanged = (app, hasChangedFacilities) => {
  const acceptableStatus = [DEAL_STATUS.CHANGES_REQUIRED];

  return (
    (app.submissionType === CONSTANTS.DEAL_SUBMISSION_TYPE.AIN || app.submissionType === CONSTANTS.DEAL_SUBMISSION_TYPE.MIN) &&
    acceptableStatus.includes(app.status) &&
    !hasChangedFacilities &&
    app.submissionCount > 0
  );
};
/**
 * @param {Object} params
 * @param {string} params.href - the URL to navigate to
 * @param {string} params.visuallyHiddenText - the visually hidden label to make it clear to a screen reader what the link is changing
 * @param {string | undefined} params.text - the text to display, component has class display-none if falsy
 * @param {string} params.id - the row id, used in the data-cy
 * @returns an array containing the action button to render
 */
const generateActionsArrayForItem = ({ href, visuallyHiddenText, text, id }) => {
  const attributes = {
    'data-cy': `${id}-action`,
  };

  if (!text) {
    return [
      {
        attributes,
        classes: 'govuk-!-display-none',
      },
    ];
  }

  return [
    {
      href,
      text,
      visuallyHiddenText,
      attributes,
    },
  ];
};

/*
  sets mapSummaryList for applicationPreview
  returns array with rows with relevant change or add links
*/
const previewItemConditions = (previewParams) => {
  const { issuedHref, unissuedHref, issuedToUnissuedHref, shouldDisplayChangeLinkIfIssued, shouldDisplayChangeLinkIfUnissued, item, app } = previewParams;
  let summaryItems = [];
  const statusMIA = [DEAL_STATUS.READY_FOR_APPROVAL, DEAL_STATUS.SUBMITTED_TO_UKEF];
  const statusAIN = [...statusMIA, DEAL_STATUS.UKEF_ACKNOWLEDGED, DEAL_STATUS.SUBMITTED_TO_UKEF, DEAL_STATUS.CHANGES_REQUIRED, DEAL_STATUS.CANCELLED];

  const validStatus =
    app.submissionType === CONSTANTS.DEAL_SUBMISSION_TYPE.AIN
      ? !statusAIN.includes(app.status)
      : !statusMIA.includes(app.status) && app.submissionType !== CONSTANTS.DEAL_SUBMISSION_TYPE.MIN;
  const ukefDecisionAccepted = app.submissionType === CONSTANTS.DEAL_SUBMISSION_TYPE.AIN || Boolean(app.ukefDecisionAccepted);

  if (summaryIssuedChangedToIssued(previewParams)) {
    /**
     * if facility changed to issued && submitted to UKEF or FURTHER MAKER'S INPUT REQUIRED && logged in as maker
     * can unissue facility which requires different href to other change to issued facilities
     * creates change link with different href to change to unissued again for the stage row
     */
    if (item.id === 'hasBeenIssued') {
      summaryItems = generateActionsArrayForItem({
        href: issuedToUnissuedHref,
        visuallyHiddenText: item.label,
        text: shouldDisplayChangeLinkIfIssued && ACTION_TEXT.CHANGE,
        id: item.id,
      });
    } else {
      /**
       * If submitted to UKEF or FURTHER MAKER'S INPUT REQUIRED && logged in as maker && facility changed to issued
       * can change name, coverStartDate and coverEndDate column
       * change link displayed taking to unissued-facility-change change page
       */
      summaryItems = generateActionsArrayForItem({
        href: unissuedHref,
        visuallyHiddenText: item.label,
        text: shouldDisplayChangeLinkIfIssued && ACTION_TEXT.CHANGE,
        id: item.id,
      });
    }
  } else if (summaryIssuedUnchanged(previewParams)) {
    /**
     * If submitted to UKEF or FURTHER MAKER'S INPUT REQUIRED && logged in as maker && facility still unissued
     * only shows if other facilities have been changed to issued
     * changes to issued
     * add link displayed taking to unissued-facility-change change page, overwriting existing value for isFacilityEndDateProvided
     */
    summaryItems = generateActionsArrayForItem({
      href: `${unissuedHref}`,
      visuallyHiddenText: item.label,
      text: shouldDisplayChangeLinkIfUnissued && ACTION_TEXT.CHANGE,
      id: item.id,
    });
  } else if (ukefDecisionAccepted && item.id === 'coverStartDate' && validStatus) {
    summaryItems = generateActionsArrayForItem({
      href: issuedHref,
      visuallyHiddenText: item.label,
      text: ukefDecisionAccepted && ACTION_TEXT.CHANGE,
      id: item.id,
    });
  }

  return summaryItems;
};

/*
  generates summaryItems for application details page
  return to maker loads application details page and if has facilities canResubmitIssuedFacilities then only makes certain fields clickable
*/
const detailItemConditions = (params) => {
  const { hasChangedFacilities, href, isCoverStartOnSubmission, item, value, app } = params;

  let summaryItems = [];

  const fieldsProvidedByCompaniesHouse = ['companyName', 'registeredAddress', 'selectedIndustry'];

  // if facilities have been canResubmitIssuedFacilities (when returning to maker)
  if (hasChangedFacilities) {
    summaryItems = previewItemConditions(params);
  } else if (isMIAWithoutChangedToIssuedFacilities(app)) {
    /**
     * edge case for returning to maker for MIA when accepting UKEF conditions but not issuing unissued facilities
     * allows for locked application details page for this condition
     */
    summaryItems = previewItemConditions(params);
  } else if (returnToMakerNoFacilitiesChanged(app, hasChangedFacilities)) {
    summaryItems = previewItemConditions(params);
  } else if (fieldsProvidedByCompaniesHouse.includes(item.id)) {
    summaryItems = generateActionsArrayForItem({
      href,
      visuallyHiddenText: item.label,
      id: item.id,
    });
  } else {
    // for all other application details page
    const linkText = isCoverStartOnSubmission || !isEmpty(value) ? ACTION_TEXT.CHANGE : ACTION_TEXT.ADD;

    summaryItems = generateActionsArrayForItem({
      href,
      visuallyHiddenText: item.label,
      text: linkText,
      id: item.id,
    });
  }

  return summaryItems;
};

/* summaryItemsConditions runs through the the table rows and decides if change/add should be added
   on end of row.  On application details, all relevant rows are set to change/add if required.  On
   application preview (once submitted to UKEF) - for facilities, certain rows are set to change add
   and given personalised href.
*/
const summaryItemsConditions = (summaryItemsObj) => {
  const { preview, item, details, app, user, data, hasChangedFacilities } = summaryItemsObj;
  const acceptableStatus = [
    DEAL_STATUS.UKEF_ACKNOWLEDGED,
    DEAL_STATUS.CHANGES_REQUIRED,
    DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS,
    DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS,
  ];
  const acceptableRole = [MAKER];
  const { id, href, shouldCoverStartOnSubmission } = item;
  const value = typeof details[item.id] === 'number' || typeof details[item.id] === 'boolean' ? details[item.id].toString() : details[item.id];
  const isCoverStartOnSubmission = id === 'coverStartDate' && shouldCoverStartOnSubmission;
  // should display `change` action when facility has been changed to issued
  const shouldDisplayChangeLinkIfIssued = calculateShouldDisplayChangeLinkOnceIssued(id);
  // should display `change` action when facility is not yet issued
  const shouldDisplayChangeLinkIfUnissued = id === 'hasBeenIssued';
  // Issued facility change link (post confirmation)
  const issuedHref = `/gef/application-details/${app._id}/${data.details._id}/confirm-cover-start-date`;
  // personalised href for facility to change to issued (once submitted to UKEF)
  let unissuedHref = `/gef/application-details/${app._id}/unissued-facilities/${data.details._id}/change`;
  if (id === 'facilityEndDate') {
    // personalised href to change facility end date (once submitted to UKEF)
    unissuedHref = `/gef/application-details/${app._id}/unissued-facilities/${data.details._id}/facility-end-date/change`;
  } else if (id === 'bankReviewDate') {
    // personalised href to change bank review date (once submitted to UKEF)
    unissuedHref = `/gef/application-details/${app._id}/unissued-facilities/${data.details._id}/bank-review-date/change`;
  }
  // personalised href for facility to change to unissued from issued (once submitted to UKEF and changed to issued)
  const issuedToUnissuedHref = `/gef/application-details/${app._id}/unissued-facilities/${data.details._id}/change-to-unissued`;
  // array of facilities which have been changed to issued
  const facilitiesChanged = canResubmitIssuedFacilities(app);

  const params = {
    app,
    user,
    data,
    hasChangedFacilities,
    facilitiesChanged,
    href,
    issuedHref,
    unissuedHref,
    issuedToUnissuedHref,
    isCoverStartOnSubmission,
    shouldDisplayChangeLinkIfIssued,
    shouldDisplayChangeLinkIfUnissued,
    item,
    value,
    acceptableStatus,
    acceptableRole,
  };

  let summaryItems = [];

  if (!preview) {
    // if application details
    summaryItems = detailItemConditions(params);
  } else {
    // maps and shows relevant change/add links for application preview
    summaryItems = previewItemConditions(params);
  }
  return summaryItems.length ? summaryItems : generateActionsArrayForItem({ id: item.id });
};

const mapSummaryList = (data, itemsToShow, mapSummaryParams, preview = false) => {
  const { app, user, hasChangedFacilities } = mapSummaryParams;

  if (!data || lodashIsEmpty(data)) {
    return [];
  }
  const { details, validation } = data;

  const valueObj = (val, isRequired, currency, detailsOther, options = {}) => {
    if (isRequired && val === null) {
      return { html: '<span class="has-text-danger" data-cy="required">Required</span>' };
    }
    /* returns text for if cover starts on submission selected
       if changing unissued to issued, should display date rather than message
    */
    if (options.shouldCoverStartOnSubmission) {
      if (options.issueDate) {
        return { text: format(new Date(options.issueDate), 'dd MMMM yyyy') };
      }
      return { text: 'Date you submit the notice' };
    }

    if (val === null || isEmpty(val)) {
      return { text: '—' };
    }

    if (options.isIndustry) {
      return { html: `${val.name}<br>${val.class.name}` };
    }

    if (isObject(val) || Array.isArray(val)) {
      const list = [];

      Object.values(val).forEach((value) => {
        if (value) {
          if (options.isDetails) {
            if (value === FACILITY_PROVIDED_DETAILS.OTHER) {
              list.push(`<li>${value} ${detailsOther ? `- ${detailsOther}` : '-'}</li>`);
            } else {
              list.push(`<li>${value}</li>`);
            }
          } else {
            list.push(`<li>${value}</li>`);
          }
        }
      });

      return { html: `<ul class="is-unstyled">${list.join('')}</ul>` };
    }

    if (options.isCurrency) {
      return {
        text: `${commaNumber(val)} ${currency.id}`,
      };
    }

    return { text: `${options.prefix || ''}${options.method ? options.method(val) : val}${options.suffix || ''}` };
  };

  return itemsToShow.map((item) => {
    const { label, prefix, suffix, method, isCurrency, isIndustry, isDetails, isHidden, shouldCoverStartOnSubmission, issueDate } = item;

    // If value is a number, convert to String as 0 can also become falsey
    const value = typeof details[item.id] === 'number' || typeof details[item.id] === 'boolean' ? details[item.id].toString() : details[item.id];
    const { currency, detailsOther } = details;
    const isRequired = validation?.required?.includes(item.id);

    // Don't show row if value is undefined
    if (value === undefined || isHidden) {
      return null;
    }

    const summaryItemsObj = {
      preview,
      item,
      details,
      app,
      user,
      data,
      hasChangedFacilities,
    };
    const summaryItems = summaryItemsConditions(summaryItemsObj);

    return {
      key: {
        text: label,
      },
      value: valueObj(value, isRequired, currency, detailsOther, {
        prefix,
        suffix,
        method,
        isCurrency,
        isIndustry,
        isDetails,
        shouldCoverStartOnSubmission,
        issueDate,
      }),
      actions: {
        items: summaryItems,
      },
    };
  });
};

const isTrueSet = (val) => {
  if (val && typeof val === 'string') {
    return val === 'true';
  }

  return null;
};

const selectDropdownAddresses = (addresses) => {
  if (!addresses) {
    return null;
  }

  const ADDRESS = addresses.length <= 1 ? 'Address' : 'Addresses';
  const placeholder = [{ text: `${addresses.length} ${ADDRESS} Found` }];
  const mappedAddresses = addresses.map((address, index) => ({
    value: index,
    text: Object.values(address)
      .filter((el) => el)
      .join(', '), // filter removes any nulls
  }));

  return placeholder.concat(mappedAddresses);
};

const stringToBoolean = (str) => (str === 'false' ? false : !!str);

const getUTCDate = () => {
  const date = new Date();
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0);
};

const getEpoch = ({ day, month, year }) => Date.UTC(year, month - 1, day);

const commentsPresent = (app) => {
  if (app.comments) {
    return app.comments.length > 0;
  }

  return false;
};

/**
 * Determines whether task comments should be displayed based on various conditions.
 *
 * @param {Object} app - The application object containing relevant data.
 * @param {string} app.status - The current status of the application.
 * @param {string} app.ukefDecision - The UKEF decision associated with the application.
 * @returns {boolean} - Returns `true` if any of the conditions for displaying task comments are met, otherwise `false`.
 */
const displayTaskComments = (app) => {
  const comments = commentsPresent(app);
  const ukefReview = isUkefReviewAvailable(app.status, app.ukefDecision);
  const unissuedFacilities = areUnissuedFacilitiesPresent(app);
  const facilityIssued = isFacilityResubmissionAvailable(app);
  const facilityAmendment = isFacilityAmendmentInProgress(app);

  return comments || ukefReview || unissuedFacilities || facilityIssued || facilityAmendment;
};

const pastDate = ({ day, month, year }) => {
  const input = getEpoch({ day, month, year });
  const now = getUTCDate();
  return input < now;
};

// checks that both dates are the same
const sameDate = ({ day, month, year }, coverEndDate) => {
  if (!coverEndDate) {
    return false;
  }

  const input = getEpoch({ day, month, year });
  // converts coverEndDate to epoch value
  const coverEndDateValue = new Date(coverEndDate).valueOf();

  return input === coverEndDateValue;
};

const futureDateInRange = ({ day, month, year }, days) => {
  if (!pastDate({ day, month, year })) {
    const input = getEpoch({ day, month, year });
    let range = getUTCDate();
    /**
     * 86400000 = 24 hours * 60 minutes * 60 seconds * 1000 ms
     * Number of ms in a day
     * */
    range += 86400000 * days;
    return input <= range;
  }
  return false;
};

const getCurrentTimePlusMinutes = (minutesToAdd = 0) => new Date(new Date().getTime() + minutesToAdd * 60 * 1000);

/**
 * checks application object for submission count or if preview mode
 * if is ^ then returns false
 * used to display supporting info change or add links
 * should be hidden if checker/MIA/AIN and returning to maker
 * logic done in nunjucks template so needs this function
 * @param {Object} application
 * @param {boolean} preview
 * @returns {boolean}
 */
const displayChangeSupportingInfo = (application, preview) => {
  if (preview || application.submissionCount > 0) {
    return false;
  }

  return true;
};

module.exports = {
  apiErrorHandler,
  isEmpty,
  isObject,
  isTrueSet,
  mapSummaryList,
  selectDropdownAddresses,
  userToken,
  validationErrorHandler,
  stringToBoolean,
  getEpoch,
  getUTCDate,
  summaryItemsConditions,
  displayTaskComments,
  pastDate,
  sameDate,
  futureDateInRange,
  getCurrentTimePlusMinutes,
  displayChangeSupportingInfo,
  isMIAWithoutChangedToIssuedFacilities,
  returnToMakerNoFacilitiesChanged,
};
