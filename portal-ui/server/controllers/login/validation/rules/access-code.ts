type FieldError = {
  text: string;
  order?: string;
};

type ValidationErrorsObject = Record<string, FieldError>;

/**
 * Access code validation rule
 * Validates that the access code field is not empty
 * @param {Object} formBody - The submitted form data
 * @param {Object} errors - Existing validation errors
 * @returns {Object} Updated validation errors object
 */
const accessCodeRule = (formBody: { signInOTP?: string }, errors: Record<string, unknown>): ValidationErrorsObject => {
  const newErrors = { ...errors } as ValidationErrorsObject;

  const { signInOTP } = formBody;

  if (!signInOTP || signInOTP.trim() === '') {
    newErrors.signInOTP = {
      text: 'Enter the access code',
      order: '1',
    };
  }

  return newErrors;
};

export default accessCodeRule;
