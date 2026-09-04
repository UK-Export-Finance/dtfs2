import { TFM_CREDIT_RATING_MAP } from '@ukef/dtfs2-common';

/**
 * Map the facility credit rating based on TFM's exporter credit rating.
 * Some ratings may still be the old Good (BB-) or Acceptable (B+) format, so we need to map them to the new format.
 * @param {string | null} exporterCreditRating - TFM's exporter's credit rating.
 * @returns {string | null} The mapped facility credit rating or null if not found.
 */
export const mapFacilityCreditRating = (exporterCreditRating?: string | null): string | null => {
  if (!exporterCreditRating) {
    return null;
  }

  if (exporterCreditRating in TFM_CREDIT_RATING_MAP) {
    return TFM_CREDIT_RATING_MAP[exporterCreditRating as keyof typeof TFM_CREDIT_RATING_MAP];
  }

  return exporterCreditRating;
};
