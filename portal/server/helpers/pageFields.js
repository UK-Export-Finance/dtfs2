exports.requiredFieldsArray = (fields) => {
  const { REQUIRED_FIELDS, CONDITIONALLY_REQUIRED_FIELDS } = fields;
  const allRequiredFields = [...REQUIRED_FIELDS];

  if (CONDITIONALLY_REQUIRED_FIELDS) {
    allRequiredFields.push(...CONDITIONALLY_REQUIRED_FIELDS);
  }

  return allRequiredFields;
};

exports.filterErrorList = (errorList, fields) => {
  const filteredErrorList = {};

  if (errorList) {
    Object.keys(errorList).forEach((error) => {
      if (fields.includes(error)) {
        filteredErrorList[error] = errorList[error];
      }
    });
  }

  return filteredErrorList;
};
