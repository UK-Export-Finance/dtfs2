import validationRules from './rules';

type FieldError = {
  text: string;
  order?: string;
};

type ValidationErrorsObject = Record<string, FieldError>;

/**
 * Combines validation rules and returns validation errors
 * @param {Object} formBody - The submitted form data
 * @returns {Object|null} Validation errors object or null if no errors
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
