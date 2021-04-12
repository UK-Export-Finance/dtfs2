import httpError from 'http-errors';
import _isEmpty from 'lodash/isEmpty';
import commaNumber from 'comma-number';
import cleanDeep from 'clean-deep';
import { FACILITY_PROVIDED_DETAILS } from '../../constants';

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
    return response;
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

/* Clean-Deep removes any properties with Null value from an Object. Therefore if all
  properties are Null, this leaves us with an Empty Object. isEmpty checks to see if the
  Object is empty or not. */
const isEmpty = (value) => _isEmpty(cleanDeep(value));

const mapSummaryList = (data, itemsToShow) => {
  if (!data || _isEmpty(data)) { return []; }
  const { details, validation } = data;
  const { required } = validation;

  const valueObj = (val, isRequired, currency, detailsOther, options = {}) => {
    if (isRequired && val === null) {
      return { html: '<span class="has-text-danger" data-cy="required">Required</span>' };
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
      label, href, prefix, suffix, method, isCurrency, isIndustry, isDetails, isHidden,
    } = item;
    // If value is a number, convert to String as 0 can also become falsey
    const value = typeof details[item.id] === 'number' || typeof details[item.id] === 'boolean' ? details[item.id].toString() : details[item.id];
    const { currency, detailsOther } = details;
    const isRequired = required.includes(item.id);

    // Don't show row if value is undefined
    if (value === undefined || isHidden) { return null; }

    return {
      key: {
        text: label,
      },
      value: valueObj(value, isRequired, currency, detailsOther, {
        prefix, suffix, method, isCurrency, isIndustry, isDetails,
      }),
      actions: {
        items: [
          ...(href ? [{
            href,
            /* Clean-Deep removes any properties with Null value from an Object. Therefore if all
            properties are Null, this leaves us with an Empty Object. isEmpty checks to see if the
            Object is empty or not. */
            text: `${!isEmpty(value) ? 'Change' : 'Add'}`,
            visuallyHiddenText: item.label,
          }] : []),
        ],
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

export {
  userToken,
  isObject,
  apiErrorHandler,
  validationErrorHandler,
  isEmpty,
  mapSummaryList,
  selectDropdownAddresses,
  status,
  isTrueSet,
};
