import { TfmDeal, TfmFacility } from '@ukef/dtfs2-common';
import { createFacility } from '../create-facility';
import { ApimGiftFacilityCreationPayload } from '../types';

type CreateFacilitiesParams = {
  deal: TfmDeal;
  facilities: TfmFacility[];
};

/**
 * Creates APIM/GIFT payloads for multiple TFM facilities.
 * @param {TfmDeal} params.deal - The TFM deal associated with the facilities being created.
 * @param {TfmFacility[]} params.facilities - An array of TFM facilities for which to create APIM/GIFT payloads.
 * @returns {ApimGiftFacilityCreationPayload[]} An array of APIM/GIFT facility creation payloads.
 */
export const createFacilities = async ({ deal, facilities }: CreateFacilitiesParams): Promise<ApimGiftFacilityCreationPayload[]> => {
  const payloads = await Promise.all(facilities.map((facility) => createFacility({ deal, facility })));

  return payloads;
};
