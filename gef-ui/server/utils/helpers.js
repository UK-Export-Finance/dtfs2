import httpError from 'http-errors';

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

  throw httpError(error.response.status, error.response.statusText, error.response.data);
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

export {
  parseBool,
  userToken,
  isObject,
  apiErrorHandler,
  validationErrorHandler,
};
