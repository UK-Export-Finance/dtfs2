import { TFM_CREDIT_RATING_MAP } from '../../../constants';

/**
 * Map the facility credit rating based on the provided credit risk ratings from APIM MDM and TFM's exporter credit rating.
 * @param {string[]} creditRiskRatings - The list of credit risk ratings from APIM MDM.
 * @param {string | undefined | null} exporterCreditRating - TFM's exporter's credit rating.
 * @returns {string | null} The mapped facility credit rating or null if not found.
 */
export const mapFacilityCreditRating = (creditRiskRatings: string[], exporterCreditRating: string | undefined | null): string | null => {
  if (!exporterCreditRating) {
    return null;
  }

  const creditRating = exporterCreditRating.trim();

  if (creditRating in TFM_CREDIT_RATING_MAP) {
    return TFM_CREDIT_RATING_MAP[creditRating as keyof typeof TFM_CREDIT_RATING_MAP];
  }

  if (creditRiskRatings.includes(creditRating)) {
    return creditRating;
  }

  return null;
};
