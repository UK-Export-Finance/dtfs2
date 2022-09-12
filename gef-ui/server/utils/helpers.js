const httpError = require('http-errors');
const lodashIsEmpty = require('lodash/isEmpty');
const commaNumber = require('comma-number');
const cleanDeep = require('clean-deep');
const { format } = require('date-fns');
const CONSTANTS = require('../constants');

const {
  facilitiesChangedToIssuedAsArray,
  summaryIssuedChangedToIssued,
  summaryIssuedUnchanged,
  areUnissuedFacilitiesPresent,
  facilitiesChangedPresent,
} = require('./facility-helpers');

const { isUkefReviewAvailable } = require('./deal-helpers');

const userToken = (req) => {
  const token = req.session.userToken;
  return token;
};

// Checks to see if an element is an object or not
const isObject = (el) => typeof el === 'object' && el !== null && !(el instanceof Array);

const isMIAWithoutChangedToIssuedFacilities = (app) =>
  app.status === CONSTANTS.DEAL_STATUS.CHANGES_REQUIRED
  && app.submissionType === CONSTANTS.DEAL_SUBMISSION_TYPE.MIA
  && app.submissionCount > 0;

// Converts Api errors into more manageable objects
const apiErrorHandler = ({ code, response }) => {
  if (code === 'ECONNABORTED') {
    throw httpError(501, 'Request timed out.');
  }
  // Is validation error
  if (response.status === 422) {
    return response;
  }

  console.error(response);
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

/*
  Maps through validation errors = require( the server and returns i)t
  so both Summary Error component and field component
  can display the error messages correctly.
*/
const validationErrorHandler = (errs, href = '') => {
  const errorSummary = [];
  const fieldErrors = {};

  if (!errs) {
    return false;
  }

  const errors = isObject(errs) ? [errs] : errs;

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
const changedToIssuedKeys = (id) =>
  id === 'name' || id === 'coverStartDate' || id === 'coverEndDate' || id === 'issueDate' || id === 'hasBeenIssued';

const returnToMakerNoFacilitiesChanged = (app, hasChangedFacilities) => {
  const acceptableStatus = [
    CONSTANTS.DEAL_STATUS.CHANGES_REQUIRED,
  ];

  return ((app.submissionType === CONSTANTS.DEAL_SUBMISSION_TYPE.AIN) || (app.submissionType === CONSTANTS.DEAL_SUBMISSION_TYPE.MIN))
    && acceptableStatus.includes(app.status) && !hasChangedFacilities && app.submissionCount > 0;
};

// summary items for application details page
const detailsSummaryItems = (href, keys, item, value) => {
  const summaryItems = [
    ...(href
      ? [
        {
          href,
          text: `${keys || !isEmpty(value) ? 'Change' : 'Add'}`,
          visuallyHiddenText: item.label,
        },
      ]
      : []),
  ];
  return summaryItems;
};

// produces summary items array for application preview page
const previewSummaryItems = (href, keys, item) => {
  const summaryItems = [
    ...(href
      ? [
        {
          href,
          text: `${keys ? 'Change' : ''}`,
          visuallyHiddenText: item.label,
        },
      ]
      : []),
  ];

  return summaryItems;
};

/*
  sets mapSummaryList for applicationPreview
  returns array with rows with relevant change or add links
*/
const previewItemConditions = (previewParams) => {
  const {
    issuedHref,
    unissuedHref,
    issuedToUnissuedHref,
    changedToIssueShow,
    unissuedShow,
    item,
    app,
  } = previewParams;
  let summaryItems = [];
  const statusMIA = [
    CONSTANTS.DEAL_STATUS.READY_FOR_APPROVAL,
    CONSTANTS.DEAL_STATUS.SUBMITTED_TO_UKEF,
  ];
  const statusAIN = [
    ...statusMIA,
    CONSTANTS.DEAL_STATUS.UKEF_ACKNOWLEDGED,
    CONSTANTS.DEAL_STATUS.SUBMITTED_TO_UKEF,
    CONSTANTS.DEAL_STATUS.CHANGES_REQUIRED,
  ];

  const validStatus = app.submissionType === CONSTANTS.DEAL_SUBMISSION_TYPE.AIN
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
      summaryItems = previewSummaryItems(issuedToUnissuedHref, changedToIssueShow, item);
    } else {
    /**
     * If submitted to UKEF or FURTHER MAKER'S INPUT REQUIRED && logged in as maker && facility changed to issued
     * can change name, coverStartDate and coverEndDate column
     * change link displayed taking to unissued-facility-change change page
     */
      summaryItems = previewSummaryItems(unissuedHref, changedToIssueShow, item);
    }
  } else if (summaryIssuedUnchanged(previewParams)) {
    /**
     * If submitted to UKEF or FURTHER MAKER'S INPUT REQUIRED && logged in as maker && facility still unissued
     * only shows if other facilities have been changed to issued
     * changes to issued
     * add link displayed taking to unissued-facility-change change page
     */
    summaryItems = previewSummaryItems(unissuedHref, unissuedShow, item);
  } else if (ukefDecisionAccepted && item.id === 'coverStartDate' && validStatus) {
    summaryItems = previewSummaryItems(issuedHref, ukefDecisionAccepted, item);
  }

  return summaryItems;
};

/*
  generates summaryItems for application details page
  return to maker loads application details page and if has facilities canResubmitIssuedFacilities then only makes certain fields clickable
*/
const detailItemConditions = (params) => {
  const {
    hasChangedFacilities,
    href,
    isCoverStartOnSubmission,
    item,
    value,
    app,
  } = params;

  let summaryItems = [];

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
  } else {
    // for all other application details page
    summaryItems = detailsSummaryItems(href, isCoverStartOnSubmission, item, value);
  }

  return summaryItems;
};

/* summaryItemsConditions runs through the the table rows and decides if change/add should be added
   on end of row.  On application details, all relevant rows are set to change/add if required.  On
   application preview (once submitted to UKEF) - for facilities, certain rows are set to change add
   and given personalised href.
*/
const summaryItemsConditions = (summaryItemsObj) => {
  const {
    preview,
    item,
    details,
    app,
    user,
    data,
    hasChangedFacilities,
  } = summaryItemsObj;
  const acceptableStatus = [
    CONSTANTS.DEAL_STATUS.UKEF_ACKNOWLEDGED,
    CONSTANTS.DEAL_STATUS.CHANGES_REQUIRED,
    CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS,
    CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS,
  ];
  const acceptableRole = [
    'maker',
  ];
  const { id, href, shouldCoverStartOnSubmission } = item;
  const value = typeof details[item.id] === 'number' || typeof details[item.id] === 'boolean' ? details[item.id].toString() : details[item.id];
  const isCoverStartOnSubmission = id === 'coverStartDate' && shouldCoverStartOnSubmission;
  // column keys to display change if facility has been changed to issued
  const changedToIssueShow = changedToIssuedKeys(id);
  // column key to display add if facility not yet issued
  const unissuedShow = id === 'hasBeenIssued';
  // Issued facility change link (post confirmation)
  const issuedHref = `/gef/application-details/${app._id}/${data.details._id}/confirm-cover-start-date`;
  // personalised href for facility to change to issued (once submitted to UKEF)
  const unissuedHref = `/gef/application-details/${app._id}/unissued-facilities/${data.details._id}/change`;
  // personalised href for facility to change to unissued from issued (once submitted to UKEF and changed to issued)
  const issuedToUnissuedHref = `/gef/application-details/${app._id}/unissued-facilities/${data.details._id}/change-to-unissued`;
  // array of facilities which have been changed to issued
  const facilitiesChanged = facilitiesChangedToIssuedAsArray(app);

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
    changedToIssueShow,
    unissuedShow,
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
  return summaryItems;
};

const mapSummaryList = (data, itemsToShow, mapSummaryParams, preview = false) => {
  const {
    app,
    user,
    hasChangedFacilities,
  } = mapSummaryParams;

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
            if (value === CONSTANTS.FACILITY_PROVIDED_DETAILS.OTHER) {
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
    const {
      label, prefix, suffix, method, isCurrency, isIndustry, isDetails, isHidden, shouldCoverStartOnSubmission, issueDate,
    } = item;

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

/*
  checks if taskComments should be shown on top of application
  if any of the below conditions are present
*/
const displayTaskComments = (app) => {
  const ukefReviewAvailable = isUkefReviewAvailable(app.status, app.ukefDecision);
  const unissuedFacilitiesPresent = areUnissuedFacilitiesPresent(app);
  const facilitiesChanged = facilitiesChangedPresent(app);
  const appCommentsPresent = commentsPresent(app);
  return (ukefReviewAvailable || unissuedFacilitiesPresent || facilitiesChanged || appCommentsPresent);
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

/**
 * checks application object for submission count or if preview mode
 * if is ^ then returns false
 * used to display supporting info change or add links
 * should be hidden if checker/MIA/AIN and returning to maker
 * logic done in nunjucks template so needs this function
 * @param {Object} application
 * @param {Boolean} preview
 * @returns {Boolean}
 */
const displayChangeSupportingInfo = (application, preview) => {
  if (preview || application.submissionCount > 0) {
    return false;
  }

  return true;
};

const canUpdateUnissuedFacilitiesCheck = (application, unissuedFacilities, facilitiesChanged, UkefDecision) => {
  if (application.submissionType === CONSTANTS.DEAL_SUBMISSION_TYPE.AIN) {
    if (unissuedFacilities && !facilitiesChanged.length) {
      return true;
    }
  } else if (unissuedFacilities && !facilitiesChanged.length && UkefDecision) {
    return true;
  }

  return false;
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
  displayChangeSupportingInfo,
  canUpdateUnissuedFacilitiesCheck,
  isMIAWithoutChangedToIssuedFacilities,
  returnToMakerNoFacilitiesChanged,
};
