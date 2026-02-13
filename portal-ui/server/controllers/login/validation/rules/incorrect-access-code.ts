type FieldError = {
  text: string;
  order?: string;
};

type ValidationErrorsObject = Record<string, FieldError>;

/**
 * Generates validation error for incorrect access code
 * This is used when the API verifies the code is incorrect
 * @param {Object} formBody - The submitted form data
 * @param {Object} errors - Existing validation errors
 * @returns {Object} Updated validation errors object with incorrect code message
 */
const incorrectAccessCodeRule = (formBody: Record<string, unknown>, errors: Record<string, unknown>): ValidationErrorsObject => {
  const newErrors = { ...errors };

  newErrors.signInOTP = {
    text: 'The access code you have entered is incorrect',
    order: '1',
  };

  return newErrors as ValidationErrorsObject;
};

export default incorrectAccessCodeRule;
