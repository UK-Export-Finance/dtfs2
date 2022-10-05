const {
  hasValue,
} = require('../../../../../helpers/string');
const { increment } = require('../../../../../helpers/number');
const generateValidationErrors = require('../../../../../helpers/validation');

const validateSubmittedValues = (submittedValues) => {
  let validationErrors = {};
  let errorsCount = 0;

  const {
    riskProfile,
  } = submittedValues;

  if (!hasValue(riskProfile)) {
    errorsCount = increment(errorsCount);

    validationErrors = generateValidationErrors(
      'riskProfile',
      'Select a risk profile',
      errorsCount,
      validationErrors,
    );
  }

  if (Object.keys(validationErrors).length > 0) {
    return validationErrors;
  }

  return false;
};

module.exports = validateSubmittedValues;
