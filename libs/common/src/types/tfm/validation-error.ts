/**
 * This validation error is used in trade-finance-manager-ui but can be mapped for
 * the other services
 */
export type GenericValidationError = {
  message: string;
  ref: string;
  fieldRefs: string[];
};
