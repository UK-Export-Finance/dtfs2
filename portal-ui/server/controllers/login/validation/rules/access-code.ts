import { ValidationErrorsObject } from '../../../../types/view-models/2fa/submit-access-code-view-model';

/**
 * Access code validation rule
 * Validates that the access code field is not empty
 * @param formBody - The submitted form data
 * @param errors - Existing validation errors
 * @returns Updated validation errors object
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
