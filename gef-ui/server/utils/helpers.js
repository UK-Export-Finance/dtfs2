import httpError from 'http-errors';
import _isEmpty from 'lodash/isEmpty';
import commaNumber from 'comma-number';

// Converts strings into Booleans
const parseBool = (params) => !(
  params === 'false'
    || params === '0'
    || params === ''
    || params === undefined
);

// Fetches the user token from session
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
    throw response;
  }

  throw httpError(response.status, response.statusText);
};

/*
  Maps through validation errors from the server and returns it
  so both Summary Error component and field component
  can display the error messages correctly.
*/
const validationErrorHandler = (errs, href = '') => {
  const errorSummary = [];
  const fieldErrors = {};

  if (!errs) { return false; }

  const errors = isObject(errs) ? [errs] : errs;

  errors.forEach((el) => {
    errorSummary.push({
      text: el.errMsg,
      href: `${href}#${el.errRef}`,
    });
    fieldErrors[el.errRef] = {
      text: el.errMsg,
    };
  });

  return {
    errorSummary,
    fieldErrors,
  };
};

const mapSummaryList = (data, itemsToShow) => {
  if (!data || _isEmpty(data)) { return []; }
  const { details, validation } = data;
  const { required } = validation;

  const valueObj = (val, isRequired, currency, options = {}) => {
    if (isRequired && val === null) {
      return { html: '<span class="has-text-danger" data-cy="required">Required</span>' };
    }

    if (val === null) {
      return { text: '—' };
    }

    if (isObject(val) || Array.isArray(val)) {
      const list = [];
      Object.values(val).forEach((value) => {
        if (value) {
          list.push(`<li>${value}</li>`);
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
      label, href, prefix, suffix, method, isCurrency,
    } = item;
    const value = details[item.id];
    const { currency } = details;
    const isRequired = required.includes(item.id);

    // Don't show row if value is undefined
    if (value === undefined) { return null; }

    return {
      key: {
        text: label,
      },
      value: valueObj(value, isRequired, currency, {
        prefix, suffix, method, isCurrency,
      }),
      actions: {
        items: [
          ...(href ? [{
            href,
            text: `${value ? 'Change' : 'Add'}`,
            visuallyHiddenText: item.label,
          }] : []),
        ],
      },
    };
  });
};

const status = ({
  0: {
    text: 'Not started',
    class: 'govuk-tag--grey',
    code: 0,
  },
  1: {
    text: 'In progress',
    class: 'govuk-tag--blue',
    code: 1,
  },
  2: {
    text: 'Completed',
    class: 'govuk-tag--green',
    code: 2,
  },
});

const facilityType = ({
  0: 'Cash',
  1: 'Contingent',
});

export {
  parseBool,
  userToken,
  isObject,
  apiErrorHandler,
  validationErrorHandler,
  mapSummaryList,
  status,
  facilityType,
};
