import stringHelpers from '../../../../helpers/string';
import { generateValidationError } from '../../../../helpers/validation';

const { hasValue } = stringHelpers;

const validateSubmittedValues = (submittedValues) => {
  let validationErrors = {};

  const {
    decision,
    approveWithConditionsComments,
    declineComments,
  } = submittedValues;

  if (!hasValue(decision)) {
    validationErrors = generateValidationError(
      'decision',
      'Select if you approve or decline',
      1,
    );
  } else if (decision === 'Approve with conditions'
    && !hasValue(approveWithConditionsComments)) {
    validationErrors = generateValidationError(
      'approveWithConditionsComments',
      'Enter conditions',
      1,
    );
  } else if (decision === 'Decline'
    && !hasValue(declineComments)) {
    validationErrors = generateValidationError(
      'declineComments',
      'Enter reasons',
      1,
    );
  }

  if (Object.keys(validationErrors).length > 0) {
    return validationErrors;
  }

  return false;
};

export default validateSubmittedValues;
