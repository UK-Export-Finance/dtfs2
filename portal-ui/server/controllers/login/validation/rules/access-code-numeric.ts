import { ValidationErrorsObject } from '../../../../types/view-models/2fa/check-your-email-access-code-view-model';

/**
 * Access code numeric validation rule
 * Validates that the access code contains only numeric digits
 * @param formBody - The submitted form data
 * @param errors - Existing validation errors
 * @returns Updated validation errors
 */
const accessCodeNumericRule = (formBody: { sixDigitAccessCode?: string }, errors: Record<string, unknown>): ValidationErrorsObject => {
  const newErrors = { ...errors } as ValidationErrorsObject;

  const { sixDigitAccessCode } = formBody;

  // Only validate if the field has content (empty validation is handled by accessCodeRule)
  if (sixDigitAccessCode && sixDigitAccessCode.trim() !== '' && !/^\d{6}$/.test(sixDigitAccessCode.trim())) {
    newErrors.sixDigitAccessCode = {
      text: 'Access code must be 6 numbers',
      order: '1',
    };
  }

  return newErrors;
};

export default accessCodeNumericRule;
