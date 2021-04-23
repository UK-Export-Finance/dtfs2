const generateValidationError = (fieldId, errorText, count) => ({
  count,
  errorList: {
    [fieldId]: {
      text: errorText,
      order: count,
    },
  },
  summary: [{
    text: errorText,
    href: `#${fieldId}`,
  }],
});

module.exports = {
  generateValidationError,
};
