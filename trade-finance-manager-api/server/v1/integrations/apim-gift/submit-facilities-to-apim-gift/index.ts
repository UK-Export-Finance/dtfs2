import { TfmDeal, TfmFacility } from '@ukef/dtfs2-common';
import { APIM_GIFT_PAYLOADS } from '../../../mappings/apim-gift-payloads';
import apiModule from '../../../api';
import { ApimGiftFacilityCreationPayload } from '../../../mappings/apim-gift-payloads/types';

type ApiTypes = {
  createGiftFacility: (facility: ApimGiftFacilityCreationPayload) => Promise<TfmFacility>;
};

type SubmitFacilitiesToApimGiftParams = {
  deal: TfmDeal;
  facilities: TfmFacility[];
};

/**
 * Submits facilities to the APIM/GIFT.
 * If only one facility is provided, create a single payload and submits it.
 * If multiple facilities are provided, create multiple payloads and submits them in parallel.
 * The function returns the response from the APIM/GIFT integration, which could be a single facility or an array of facilities depending on the input.
 * @param {SubmitFacilitiesToApimGiftParams} params - An object containing the deal and facilities to be submitted.
 * @param {TfmDeal} params.deal - The TFM deal associated with the facilities being submitted.
 * @param {TfmFacility[]} params.facilities - An array of TFM facilities to be submitted to APIM/GIFT.
 * @returns {Promise<TfmFacility | TfmFacility[]>} A promise that resolves to the response from the APIM/GIFT integration.
 */
export const submitFacilitiesToApimGift = async ({ deal, facilities }: SubmitFacilitiesToApimGiftParams): Promise<TfmFacility | TfmFacility[]> => {
  const api = apiModule as ApiTypes;

  if (facilities.length === 1) {
    const payload = await APIM_GIFT_PAYLOADS.createFacility({ deal, facility: facilities[0] });

    const response = await api.createGiftFacility(payload);

    return response;
  }

  const payloads = await APIM_GIFT_PAYLOADS.createFacilities({ deal, facilities });

  const promises = await Promise.all(payloads.map((payload: ApimGiftFacilityCreationPayload) => api.createGiftFacility(payload)));

  return promises.flat();
};
