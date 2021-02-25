import httpError from 'http-errors';
import _isEmpty from 'lodash/isEmpty';

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
  const { details, required } = data;
  // if (!details || _isEmpty(details)) { return []; }

  const valueObj = (val, isRequired) => {
    if (isRequired && val === null) {
      return { html: '<span class="has-text-danger" data-cy="required">Required</span>' };
    }

    if (val === null) {
      return { text: '—' };
    }

    if (isObject(val)) {
      const list = [];
      Object.values(val).forEach((value) => {
        if (value) {
          list.push(`<li>${value}</li>`);
        }
      });

      return { html: `<ul class="is-unstyled">${list.join('')}</ul>` };
    }

    return { text: val };
  };

  return itemsToShow.map((item) => {
    const { label, href } = item;
    const value = details[item.id];
    const isRequired = required.includes(item.id);

    return {
      key: {
        text: label,
      },
      value: valueObj(value, isRequired),
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

export {
  parseBool,
  userToken,
  isObject,
  apiErrorHandler,
  validationErrorHandler,
  mapSummaryList,
};
