/**
 * This validation error is returned by common validation functions (e.g. applyStandardValidationAndParseDateInput )
 * It is also used in trade-finance-manager-ui but should be mapped for the other services
 */
export type GenericValidationError = {
  message: string;
  ref: string;
  fieldRefs: string[];
};
