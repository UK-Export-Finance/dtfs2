/**
 * @param guaranteeExpiryDate Facility cover end date, maps to expirationDate
 */
export const guaranteeExpiryDateTransformation = (guaranteeExpiryDate) => guaranteeExpiryDate && { expirationDate: guaranteeExpiryDate };
