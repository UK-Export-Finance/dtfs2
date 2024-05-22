const { DEAL_SUBMISSION_TYPE } = require('../../constants');

const getValidationErrors = (fields, allCriteria) => {
  const receivedFields = Object.keys(fields);
  const errorsToDisplay = allCriteria.filter((criterion) => !receivedFields.includes(String(criterion.id)));

  return errorsToDisplay.map((error) => ({
    errRef: error.id,
    errMsg: `${error.id}. ${error.errMsg}`,
  }));
};

const deriveCoverType = (fields, allCriteria) => {
  const receivedFields = Object.values(fields);

  if (receivedFields.length !== allCriteria.length) return undefined;
  if (receivedFields.every((field) => field === 'true')) return DEAL_SUBMISSION_TYPE.AIN;
  if (receivedFields.some((field) => field === 'false')) return DEAL_SUBMISSION_TYPE.MIA;

  return undefined;
};

module.exports = {
  getValidationErrors,
  deriveCoverType,
};
