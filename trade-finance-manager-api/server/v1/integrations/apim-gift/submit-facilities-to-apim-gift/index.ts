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
 * @returns {Promise<TfmFacility | TfmFacility[] | boolean>} A promise that resolves to the response from the APIM/GIFT integration.
 */
export const submitFacilitiesToApimGift = async ({
  deal,
  facilities,
  isBssEwcsDeal,
  isGefDeal,
}: SubmitFacilitiesToApimGiftParams): Promise<TfmFacility | TfmFacility[] | boolean> => {
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

    return response;
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

  /**
   * For typing, the response from the APIM/GIFT integration is expected to be an array of TfmFacility objects, but in the case where all API calls fail, this would result in an empty array.
   * Therefore we need ot filter the responses to ensure we only return the successful responses, which could be an array of TfmFacility objects or an empty array if all API calls fail.
   *
   * If the API call to create a facility in APIM/GIFT fails for any of the facilities, we do NOT want to throw an error.
   * Instead, continue with the successful responses, which could result in some facilities being created in GIFT and some not being created.
   * But at least the facilities that can be created in GIFT will be created and the issues with the facilities that cannot be created can be investigated separately.
   * If all API calls fail, this will result in an empty array of successful responses, which is preferable to the entire function throwing an error and no facilities being created in GIFT.
   * Ultimately, this will trigger an alert in APIM for the failed API calls, which can be investigated by the team.
   * The alternative of this would be to have retry logic in DTFS, but given the low likelihood of the API calls failing and the fact that facility creation in GIFT can be "best effort", this is not necessary.
   * Note that this is an edge case scenario as most facilities should be able to be created in GIFT without issue.
   */
  const successfulResponses = promises.filter((response): response is TfmFacility => Boolean(response));

  return successfulResponses;
};
