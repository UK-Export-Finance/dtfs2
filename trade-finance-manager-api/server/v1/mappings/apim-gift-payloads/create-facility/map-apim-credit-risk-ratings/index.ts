import { CreditRiskRating } from '../../../../api-response-types';

// TODO: move to a higher directory?

/**
 * Map the APIM MDM response for credit risk ratings to simple array of descriptions.
 * @param {any} creditRiskRatingsResponse - The raw response from the APIM MDM credit risk ratings endpoint.
 * @returns {string[]} The list of credit risk rating descriptions, or an empty array if the response is not in the expected format.
 * @example
 * // Given the following APIM MDM response:
 * const creditRiskRatingsResponse = [
 *   { id: 1, description: 'AAA' },
 *   { id: 2, description: 'AA+' },
 *   { id: 3, description: 'AA' },
 * ];
 *
 * // This will be returned:
 * ['AAA', 'AA+', 'AA']
 */
export const mapApimCreditRiskRatings = (creditRiskRatingsResponse: any): string[] => {
  if (!Array.isArray(creditRiskRatingsResponse)) {
    return [];
  }

  return creditRiskRatingsResponse.map((creditRiskRating: CreditRiskRating) => creditRiskRating?.description);
};
