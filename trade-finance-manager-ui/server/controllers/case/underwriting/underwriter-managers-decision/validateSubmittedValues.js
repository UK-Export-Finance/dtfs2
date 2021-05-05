import { hasValue } from '../../../../helpers/string';
import increment from '../../../../helpers/number';
import generateValidationErrors from '../../../../helpers/validation';

const validateSubmittedValues = (submittedValues) => {
  let validationErrors = {};
  let errorsCount = 0;

  const MAX_COMMENTS_LENGTH = 1000;

  const {
    decision,
    approveWithConditionsComments,
    declineComments,
    internalComments,
  } = submittedValues;

  if (!hasValue(decision)) {
    errorsCount = increment(errorsCount);

    validationErrors = generateValidationErrors(
      'decision',
      'Select if you approve or decline',
      errorsCount,
      validationErrors,
    );
  }

  if (decision === 'Approve with conditions') {
    if (!hasValue(approveWithConditionsComments)) {
      errorsCount = increment(errorsCount);

      validationErrors = generateValidationErrors(
        'approveWithConditionsComments',
        'Enter conditions',
        errorsCount,
        validationErrors,
      );
    }

    if (hasValue(approveWithConditionsComments)
      && approveWithConditionsComments.length > MAX_COMMENTS_LENGTH) {
      errorsCount = increment(errorsCount);

      validationErrors = generateValidationErrors(
        'approveWithConditionsComments',
        `Conditions must be ${MAX_COMMENTS_LENGTH} or fewer`,
        errorsCount,
        validationErrors,
      );
    }
  }

  if (decision === 'Decline') {
    if (!hasValue(declineComments)) {
      errorsCount = increment(errorsCount);

      validationErrors = generateValidationErrors(
        'declineComments',
        'Enter reasons',
        errorsCount,
        validationErrors,
      );
    }

    if (hasValue(declineComments)
      && declineComments.length > MAX_COMMENTS_LENGTH) {
      errorsCount = increment(errorsCount);

      validationErrors = generateValidationErrors(
        'declineComments',
        `Reasons must be ${MAX_COMMENTS_LENGTH} or fewer`,
        errorsCount,
        validationErrors,
      );
    }
  }

  if (hasValue(internalComments)
    && internalComments.length > MAX_COMMENTS_LENGTH) {
    errorsCount = increment(errorsCount);

    validationErrors = generateValidationErrors(
      'internalComments',
      `Comments must be ${MAX_COMMENTS_LENGTH} or fewer`,
      errorsCount,
      validationErrors,
    );
  }

  if (Object.keys(validationErrors).length > 0) {
    return validationErrors;
  }

  return false;
};

export default validateSubmittedValues;
