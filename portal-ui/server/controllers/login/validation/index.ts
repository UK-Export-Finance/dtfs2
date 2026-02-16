import { ValidationErrorsObject } from '../../../types/view-models/2fa/submit-access-code-view-model';
import validationRules from './rules';

/**
 * Combines validation rules and returns validation errors
 * @param formBody - The submitted form data
 * @returns Validation errors object or null if no errors
 */
const generateValidationErrors = (formBody: Record<string, unknown>): ValidationErrorsObject | null => {
  let errors: ValidationErrorsObject = {};

  validationRules.forEach((rule) => {
    errors = rule(formBody, errors);
  });

  const hasErrors = Object.keys(errors).length > 0;

  return hasErrors ? errors : null;
};

export default generateValidationErrors;
