const CONSTANTS = require('../../constants');

const { hasValue, isAlphanumeric } = require('../../helpers/string');
const { increment } = require('../../helpers/number');
const generateValidationErrors = require('../../helpers/validation');

const MAX_COMMENTS_LENGTH = 1000;

const validateCommentField = (validationErrors, errorsCount, fieldLabel, fieldId, value) => {
  let errors = validationErrors;
  let count = errorsCount;

  if (!isAlphanumeric(value)) {
    count = increment(count);

    errors = generateValidationErrors(fieldId, `${fieldLabel} must only include letters a to z, numbers, hyphens, commas and spaces`, count, errors);
  }

  // remove new lines from textarea input value
  const strippedValueArray = value.split(/[\r]/g);

  // combine split values into single array
  const strippedValue = strippedValueArray.reduce((a, b) => [...a, ...b], []);

  if (strippedValue.length > MAX_COMMENTS_LENGTH) {
    count = increment(count);

    errors = generateValidationErrors(fieldId, `${fieldLabel} must be ${MAX_COMMENTS_LENGTH} characters or fewer`, count, errors);
  }

  return {
    errorsCount: count,
    validationErrors: errors,
  };
};

const validateSubmittedValues = (submittedValues) => {
  let validationErrors = {};
  let errorsCount = 0;

  const { decision, approveWithConditionsComments, declineComments, internalComments } = submittedValues;

  if (!hasValue(decision)) {
    errorsCount = increment(errorsCount);

    validationErrors = generateValidationErrors('decision', 'Select if you approve or decline', errorsCount, validationErrors);
  }

  if (decision === CONSTANTS.DECISIONS.UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS) {
    if (!hasValue(approveWithConditionsComments)) {
      errorsCount = increment(errorsCount);

      validationErrors = generateValidationErrors('approveWithConditionsComments', 'Enter conditions', errorsCount, validationErrors);
    }

    if (hasValue(approveWithConditionsComments)) {
      const validatedConditionsComments = validateCommentField(
        validationErrors,
        errorsCount,
        'Conditions',
        'approveWithConditionsComments',
        approveWithConditionsComments,
      );

      validationErrors = validatedConditionsComments.validationErrors;
      errorsCount = validatedConditionsComments.errorsCount;
    }
  }

  if (decision === CONSTANTS.DECISIONS.UNDERWRITER_MANAGER_DECISIONS.DECLINED) {
    if (!hasValue(declineComments)) {
      errorsCount = increment(errorsCount);

      validationErrors = generateValidationErrors('declineComments', 'Enter reasons', errorsCount, validationErrors);
    }

    if (hasValue(declineComments)) {
      const validatedDeclineComments = validateCommentField(validationErrors, errorsCount, 'Reasons', 'declineComments', declineComments);

      validationErrors = validatedDeclineComments.validationErrors;
      errorsCount = validatedDeclineComments.errorsCount;
    }
  }

  if (hasValue(internalComments)) {
    const validatedInternalComments = validateCommentField(validationErrors, errorsCount, 'Comments', 'internalComments', internalComments);

    validationErrors = validatedInternalComments.validationErrors;
    errorsCount = validatedInternalComments.errorsCount;
  }

  if (Object.keys(validationErrors).length > 0) {
    return validationErrors;
  }

  return false;
};

module.exports = {
  validateCommentField,
  validateSubmittedValues,
};
