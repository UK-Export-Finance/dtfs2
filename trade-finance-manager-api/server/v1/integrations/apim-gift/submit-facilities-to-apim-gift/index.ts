import { TfmDeal, TfmFacility } from '@ukef/dtfs2-common';
import { APIM_GIFT_PAYLOADS } from '../../../mappings/apim-gift-payloads';
import apiModule from '../../../api';
import { ApimGiftFacilityCreationPayload, ApiTypes } from '../../../mappings/apim-gift-payloads/types';
import { getReferenceData } from './get-reference-data';

type SubmitFacilitiesToApimGiftParams = {
  deal: TfmDeal;
  facilities: TfmFacility[];
  isBssEwcsDeal: boolean;
  isGefDeal: boolean;
};

/**
 * Submits facilities to the APIM/GIFT.
 * If only one facility is provided, create a single payload and submits it.
 * If multiple facilities are provided, create multiple payloads and submits them in parallel.
 * The function returns the response from the APIM/GIFT integration, which could be a single facility or an array of facilities depending on the input.
 * @param {SubmitFacilitiesToApimGiftParams} params - An object containing the deal and facilities to be submitted.
 * @param {TfmDeal} params.deal - The TFM deal associated with the facilities being submitted.
 * @param {TfmFacility[]} params.facilities - An array of TFM facilities to be submitted to APIM/GIFT.
 * @param {boolean} params.isBssEwcsDeal - A boolean indicating whether the deal is a BSS/EWCS deal, which determines how certain facility values are mapped.
 * @param {boolean} params.isGefDeal - A boolean indicating whether the deal is a GEF deal, which determines how certain facility values are mapped.
 * @returns {Promise<TfmFacility | TfmFacility[]>} A promise that resolves to the response from the APIM/GIFT integration.
 */
export const submitFacilitiesToApimGift = async ({
  deal,
  facilities,
  isBssEwcsDeal,
  isGefDeal,
}: SubmitFacilitiesToApimGiftParams): Promise<TfmFacility | TfmFacility[]> => {
  const api = apiModule as ApiTypes;

  const { facilityCategories, creditRiskRatings } = await getReferenceData(isGefDeal);

  if (facilities.length === 1) {
    const payload = await APIM_GIFT_PAYLOADS.createFacility({
      deal,
      facility: facilities[0],
      isBssEwcsDeal,
      isGefDeal,
      facilityCategories,
      creditRiskRatings,
    });

    const response = await api.createGiftFacility(payload);

    return response || [];
  }

  const payloads = await APIM_GIFT_PAYLOADS.createFacilities({
    deal,
    facilities,
    isBssEwcsDeal,
    isGefDeal,
    facilityCategories,
    creditRiskRatings,
  });

  const promises = await Promise.all(payloads.map((payload: ApimGiftFacilityCreationPayload) => api.createGiftFacility(payload)));

  const successfulResponses = promises.filter((response): response is TfmFacility => Boolean(response));

  return successfulResponses;
};
