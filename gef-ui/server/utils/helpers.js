import httpError from 'http-errors';
import _isEmpty from 'lodash/isEmpty';

const parseBool = (params) => !(
  params === 'false'
    || params === '0'
    || params === ''
    || params === undefined
);

const userToken = (req) => {
  const token = req.session.userToken;
  return token;
};

const isObject = (el) => typeof el === 'object' && el !== null && !(el instanceof Array);

const apiErrorHandler = (error) => {
  if (error.code === 'ECONNABORTED') {
    throw httpError(501, 'Request timed out.');
  }
  // Is validation error
  if (error.response.status === 422) {
    return {
      response: {
        status: error.response.status,
        messages: error.response.data,
      },
    };
  }

  throw httpError(error.response.status, error.response.statusText);
};

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

  return itemsToShow.map((item) => {
    const { label, href } = item;
    const value = data[item.id];

    return {
      key: {
        text: label,
      },
      value: {
        text: value || '—',
      },
      actions: {
        items: [
          {
            href: href || null,
            text: `${value ? 'Change' : 'Add'}`,
            visuallyHiddenText: item.label,
          },
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
