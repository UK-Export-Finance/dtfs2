const { isString } = require('./string');

const generateValidationErrors = (fieldId, errorText, count, errors = { errorList: {}, summary: [] }) => {
  let summary = [
    {
      text: errorText,
      href: `#${fieldId}`,
    },
  ];

  if (errors && errors.summary && errors.summary.length) {
    summary = [
      ...errors.summary,
      {
        text: errorText,
        href: `#${fieldId}`,
      },
    ];
  }

  const result = {
    count,
    errorList: {
      ...errors.errorList,
      [fieldId]: {
        text: errorText,
        order: count,
      },
    },
    summary,
  };

  return result;
};

/**
 * @param {unknown} value - the value to check
 * @param {string} context - provides context in the error message if value is not a string. Usually would be the name
 *  of the variable being passed in
 * @returns {string}
 */
const asString = (value, context) => {
  if (!isString(value)) {
    throw new Error(`Expected ${context} to be a string, but was ${typeof value}`);
  }

  return value;
};

module.exports = {
  generateValidationErrors,
  asString,
};
