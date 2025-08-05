// APIM - MDM - Responses

/**
 * Represents an industry sector with various identifiers and metadata.
 *
 * @property {number} id - Unique identifier for the industry sector.
 * @property {string} ukefSectorId - UKEF sector identifier.
 * @property {string} ukefSectorName - Name of the UKEF sector.
 * @property {null} internalNo - Internal number (currently unused).
 * @property {string} ukefIndustryId - UKEF industry identifier.
 * @property {string} ukefIndustryName - Name of the UKEF industry.
 * @property {string} acbsSectorId - ACBS sector identifier.
 * @property {string} acbsSectorName - Name of the ACBS sector.
 * @property {string} acbsIndustryId - ACBS industry identifier.
 * @property {string} acbsIndustryName - Name of the ACBS industry.
 * @property {string} created - ISO date string when the sector was created.
 * @property {string} updated - ISO date string when the sector was last updated.
 * @property {string} effectiveFrom - ISO date string when the sector becomes effective.
 * @property {string} effectiveTo - ISO date string when the sector is no longer effective.
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
