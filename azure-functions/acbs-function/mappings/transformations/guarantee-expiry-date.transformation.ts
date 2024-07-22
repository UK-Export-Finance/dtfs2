import { GuaranteeExpiryDate } from '../types';

/**
 * @param guaranteeExpiryDate Facility cover end date, maps to expirationDate
 */
export const guaranteeExpiryDateTransformation = (guaranteeExpiryDate: GuaranteeExpiryDate | undefined) =>
  guaranteeExpiryDate && { expirationDate: guaranteeExpiryDate };
