import { ValidationErrorsObject } from '../../../../types/view-models/2fa/check-your-email-access-code-view-model';

/**
 * Generates validation error for incorrect access code
 * This is used when the API verifies the code is incorrect
 * @param formBody - The submitted form data
 * @param errors - Existing validation errors
 * @returns Updated validation errors object with incorrect code message
 */
const incorrectAccessCodeRule = (formBody: Record<string, unknown>, errors: Record<string, unknown>): ValidationErrorsObject => {
  const newErrors = { ...errors };

  newErrors.sixDigitAccessCode = {
    text: 'The access code you have entered is incorrect',
    order: '1',
  };

  return newErrors as ValidationErrorsObject;
};

export default incorrectAccessCodeRule;
