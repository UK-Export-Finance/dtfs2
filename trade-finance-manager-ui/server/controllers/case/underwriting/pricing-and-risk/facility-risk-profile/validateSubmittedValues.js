const {
  hasValue,
} = require('#server-helpers/string.js');
const { increment } = require('#server-helpers/number.js');
const generateValidationErrors = require('#server-helpers/validation.js');

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
