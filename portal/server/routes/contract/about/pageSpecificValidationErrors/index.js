import { pageSpecificValidationErrors } from '../../../../helpers';
import FIELDS from './pageFields';

export const supplierValidationErrors = (validationErrors, submittedValues) => 
  pageSpecificValidationErrors(validationErrors, FIELDS.SUPPLIER, submittedValues);

export const buyerValidationErrors = (validationErrors, submittedValues) =>
  pageSpecificValidationErrors(validationErrors, FIELDS.BUYER, submittedValues);
