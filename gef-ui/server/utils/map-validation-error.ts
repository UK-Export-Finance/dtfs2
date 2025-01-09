import { GenericValidationError } from '@ukef/dtfs2-common';
import { ValidationError } from '../types/validation-error';

/**
 * The commonised validation `applyStandardValidationAndParseDateInput` returns a `GenericValidationError` object but
 * in gef-ui a different type `ValidationError` is used. This function maps the `GenericValidationError` to a `ValidationError`.
 * @param validationError - a tfm validation error
 * @returns the mapped validation error
 */
export const mapValidationError = (validationError: GenericValidationError): ValidationError => {
  return {
    errRef: validationError.ref,
    errMsg: validationError.message,
    subFieldErrorRefs: validationError.fieldRefs,
  };
};
