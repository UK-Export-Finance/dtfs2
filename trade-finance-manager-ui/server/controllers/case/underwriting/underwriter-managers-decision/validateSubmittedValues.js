import { hasValue } from '../../../../helpers/string';
import { increment } from '../../../../helpers/number';
import { generateValidationError } from '../../../../helpers/validation';

const validateSubmittedValues = (submittedValues) => {
  let validationErrors = {};
  let errorsCount = 0;

  const MAX_COMMENTS_LENGTH = 1000;

  const {
    decision,
    approveWithConditionsComments,
    declineComments,
  } = submittedValues;

  if (!hasValue(decision)) {
    errorsCount = increment(errorsCount);

    validationErrors = generateValidationError(
      'decision',
      'Select if you approve or decline',
      errorsCount,
    );
  }

  if (decision === 'Approve with conditions') {
    if (!hasValue(approveWithConditionsComments)) {
      errorsCount = increment(errorsCount);

      validationErrors = generateValidationError(
        'approveWithConditionsComments',
        'Enter conditions',
        errorsCount,
      );
    }

    if (hasValue(approveWithConditionsComments)
      && approveWithConditionsComments.length > MAX_COMMENTS_LENGTH) {
      errorsCount = increment(errorsCount);

      validationErrors = generateValidationError(
        'approveWithConditionsComments',
        `Conditions must be ${MAX_COMMENTS_LENGTH} or fewer`,
        errorsCount,
      );
    }
  }

  if (decision === 'Decline') {
    if (!hasValue(declineComments)) {
      errorsCount = increment(errorsCount);

      validationErrors = generateValidationError(
        'declineComments',
        'Enter reasons',
        errorsCount,
      );
    }

    if (hasValue(declineComments)
      && declineComments.length > MAX_COMMENTS_LENGTH) {
      errorsCount = increment(errorsCount);

      validationErrors = generateValidationError(
        'declineComments',
        `Reasons must be ${MAX_COMMENTS_LENGTH} or fewer`,
        errorsCount,
      );
    }
  }

  if (Object.keys(validationErrors).length > 0) {
    return validationErrors;
  }

  return false;
};

export default validateSubmittedValues;
