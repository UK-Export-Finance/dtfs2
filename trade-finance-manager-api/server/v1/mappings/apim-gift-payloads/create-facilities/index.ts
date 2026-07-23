import { TfmDeal, TfmFacility } from '@ukef/dtfs2-common';
import { createFacility } from '../create-facility';
import { FacilityCategory } from '../../../api-response-types';
import { ApimGiftFacilityCreationPayload } from '../types';

type CreateFacilitiesParams = {
  creditRiskRatings: string[];
  deal: TfmDeal;
  facilities: TfmFacility[];
  facilityCategories: FacilityCategory[];
  isBssEwcsDeal: boolean;
  isGefDeal: boolean;
  newPartyUrnCreated: boolean;
};

/**
 * Creates APIM/GIFT payloads for multiple TFM facilities.
 * @param {string[]} params.creditRiskRatings - An array of credit risk rating descriptions from APIM, required for mapping the facility credit risk rating to the format expected by APIM.
 * @param {TfmDeal} params.deal - The TFM deal associated with the facilities being created.
 * @param {TfmFacility[]} params.facilities - An array of TFM facilities for which to create APIM/GIFT payloads.
 * @param {FacilityCategory[]} params.facilityCategories - An array of facility categories from APIM, required for mapping the facility category to the format expected by APIM.
 * @param {boolean} params.isBssEwcsDeal - A boolean indicating whether the deal is a BSS/EWCS deal, which determines how certain facility values are mapped.
 * @param {boolean} params.isGefDeal - A boolean indicating whether the deal is a GEF deal, which determines how certain facility values are mapped.
 * @param {boolean} params.newPartyUrnCreated - A boolean indicating whether a new party URN was created for the exporter, which determines how certain facility values are mapped.
 * @returns {ApimGiftFacilityCreationPayload[]} An array of APIM/GIFT facility creation payloads.
 */
export const createFacilities = async ({
  creditRiskRatings,
  deal,
  facilities,
  facilityCategories,
  isBssEwcsDeal,
  isGefDeal,
  newPartyUrnCreated,
}: CreateFacilitiesParams): Promise<ApimGiftFacilityCreationPayload[]> => {
  const payloads = await Promise.all(
    facilities.map((facility) =>
      createFacility({
        deal,
        facility,
        isBssEwcsDeal,
        isGefDeal,
        creditRiskRatings,
        facilityCategories,
        newPartyUrnCreated,
      }),
    ),
  );

  return payloads;
};
