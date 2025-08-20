// APIM - MDM - Responses

/**
 * Represents an industry sector with various identifiers and metadata.
 *
 * @property id - Unique identifier for the industry sector.
 * @property ukefSectorId - UKEF sector identifier.
 * @property ukefSectorName - Name of the UKEF sector.
 * @property internalNo - Internal number (currently unused).
 * @property ukefIndustryId - UKEF industry identifier.
 * @property ukefIndustryName - Name of the UKEF industry.
 * @property acbsSectorId - ACBS sector identifier.
 * @property acbsSectorName - Name of the ACBS sector.
 * @property acbsIndustryId - ACBS industry identifier.
 * @property acbsIndustryName - Name of the ACBS industry.
 * @property created - ISO date string when the sector was created.
 * @property updated - ISO date string when the sector was last updated.
 * @property effectiveFrom - ISO date string when the sector becomes effective.
 * @property effectiveTo - ISO date string when the sector is no longer effective.
 */
export type industrySector = {
  id: number;
  ukefSectorId: string;
  ukefSectorName: string;
  internalNo: null;
  ukefIndustryId: string;
  ukefIndustryName: string;
  acbsSectorId: string;
  acbsSectorName: string;
  acbsIndustryId: string;
  acbsIndustryName: string;
  created: string;
  updated: string;
  effectiveFrom: string;
  effectiveTo: string;
};
