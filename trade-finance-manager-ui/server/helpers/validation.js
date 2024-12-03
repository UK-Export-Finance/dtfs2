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

module.exports = {
  generateValidationErrors,
};
