const isObject = require('./isObject.helper');

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

module.exports = { validationErrorHandler };
