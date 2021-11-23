const httpError = require('http-errors');
const lodashIsEmpty = require('lodash/isEmpty');
const commaNumber = require('comma-number');
const cleanDeep = require('clean-deep');
const { FACILITY_PROVIDED_DETAILS } = require('../../constants');

// Fetches the user token = require( sessio)n
const userToken = (req) => {
  const token = req.session.userToken;
  return token;
};

// Checks to see if an element is an object or not
const isObject = (el) => typeof el === 'object' && el !== null && !(el instanceof Array);

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
    FIELD_INVALID_CHARACTERS: 'Application reference must only include letters a to z, full stops, commas, colons, semi-colons, hyphens, spaces and apostrophes”',
  },
  additionalRefName: {
    MANDATORY_FIELD: 'Additional reference name is mandatory',
    FIELD_TOO_LONG: 'Additional reference name can only be up to 30 characters in length',
    FIELD_INVALID_CHARACTERS: 'Additional reference name must only include letters a to z, full stops, commas, colons, semi-colons, hyphens, spaces and apostrophes”',
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

  if (!errs) { return false; }

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

const mapSummaryList = (data, itemsToShow, preview = false) => {
  if (!data || lodashIsEmpty(data)) { return []; }
  const { details, validation } = data;
  const { required } = validation;

  const valueObj = (val, isRequired, currency, detailsOther, options = {}) => {
    if (isRequired && val === null) {
      return { html: '<span class="has-text-danger" data-cy="required">Required</span>' };
    }

    if (options.shouldCoverStartOnSubmission) {
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
            if (value === 'OTHER') {
              list.push(`<li>${FACILITY_PROVIDED_DETAILS[value]} ${detailsOther ? '-' : ''} ${detailsOther}</li>`);
            } else {
              list.push(`<li>${FACILITY_PROVIDED_DETAILS[value]}</li>`);
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
        text: `${commaNumber(val)} ${currency}`,
      };
    }

    return { text: `${options.prefix || ''}${options.method ? options.method(val) : val}${options.suffix || ''}` };
  };

  return itemsToShow.map((item) => {
    const {
      id, label, href, prefix, suffix, method, isCurrency, isIndustry, isDetails, isHidden,
      shouldCoverStartOnSubmission,
    } = item;
    // If value is a number, convert to String as 0 can also become falsey
    const value = typeof details[item.id] === 'number' || typeof details[item.id] === 'boolean' ? details[item.id].toString() : details[item.id];
    const { currency, detailsOther } = details;
    const isRequired = required.includes(item.id);
    const isCoverStartOnSubmission = (id === 'coverStartDate' && shouldCoverStartOnSubmission);

    // Don't show row if value is undefined
    if (value === undefined || isHidden) { return null; }

    let summaryItems = [];
    if (!preview) {
      summaryItems = [
        ...(href ? [{
          href,
          /* Clean-Deep removes any properties with Null value = require( an Object. Therefore if al)l
          properties are Null, this leaves us with an Empty Object. isEmpty checks to see if the
          Object is empty or not. */
          text: `${isCoverStartOnSubmission || !isEmpty(value) ? 'Change' : 'Add'}`,
          visuallyHiddenText: item.label,
        }] : []),
      ];
    }
    return {
      key: {
        text: label,
      },
      value: valueObj(value, isRequired, currency, detailsOther, {
        prefix, suffix, method, isCurrency, isIndustry, isDetails, shouldCoverStartOnSubmission,
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

const getApplicationType = (isAutomaticCover) => {
  if (isAutomaticCover === true) {
    return 'Automatic inclusion notice';
  }
  if (isAutomaticCover === false) {
    return 'Manual inclusion notice';
  }
  return 'Unknown';
};

const selectDropdownAddresses = (addresses) => {
  if (!addresses) { return null; }

  const ADDRESS = addresses.length <= 1 ? 'Address' : 'Addresses';
  const placeholder = [{ text: `${addresses.length} ${ADDRESS} Found` }];
  const mappedAddresses = addresses.map((address, index) => ({
    value: index,
    text: Object.values(address).filter((el) => el).join(', '), // filter removes any nulls
  }));

  return placeholder.concat(mappedAddresses);
};

const status = ({
  NOT_STARTED: {
    text: 'Not started',
    class: 'govuk-tag--grey',
    code: 'NOT_STARTED',
  },
  IN_PROGRESS: {
    text: 'In progress',
    class: 'govuk-tag--blue',
    code: 'IN_PROGRESS',
  },
  COMPLETED: {
    text: 'Completed',
    class: 'govuk-tag--green',
    code: 'COMPLETED',
  },
});

const stringToBoolean = (str) => (str === 'false' ? false : !!str);

const isNotice = (type) => type.toLowerCase().includes('notice');

module.exports = {
  apiErrorHandler,
  getApplicationType,
  isEmpty,
  isObject,
  isTrueSet,
  mapSummaryList,
  selectDropdownAddresses,
  status,
  userToken,
  validationErrorHandler,
  stringToBoolean,
  isNotice,
};
