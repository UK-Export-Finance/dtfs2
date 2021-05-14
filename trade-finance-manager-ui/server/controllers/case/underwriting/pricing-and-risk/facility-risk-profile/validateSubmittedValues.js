import {
  hasValue,
} from '../../../../../helpers/string';
import increment from '../../../../../helpers/number';
import generateValidationErrors from '../../../../../helpers/validation';

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

export default validateSubmittedValues;
