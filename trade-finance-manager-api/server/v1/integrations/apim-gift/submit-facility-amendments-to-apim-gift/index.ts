import apiModule from '../../../api';
import { APIM_GIFT_PAYLOADS } from '../../../mappings/apim-gift-payloads';
import { ApiTypes, TfmFacilityAmendmentData } from '../../../mappings/apim-gift-payloads/types';

type SubmitFacilityAmendmentToApimGiftParams = {
  amendment: TfmFacilityAmendmentData;
  ukefFacilityId: string;
};

type SubmitFacilityAmendmentToApimGiftResponse = (object | false)[] | false;

/**
 * Submits facility amendments to APIM/GIFT.
 * The function takes the facility amendment data from TFM and maps it to one or more APIM/GIFT payloads using the APIM_GIFT_PAYLOADS.amendFacility mapping function.
 * Each payload is then submitted sequentially to the APIM/GIFT integration using the amendGiftFacility API call.
 * @param {SubmitFacilityAmendmentToApimGiftParams} params - The parameters for submitting the facility amendment.
 * @param {TfmFacilityAmendmentData} params.amendment - The facility amendment data from TFM.
 * @param {string} params.ukefFacilityId - The UKEF facility ID.
 * @returns The array of responses from the APIM/GIFT system, or false if no valid payloads can be produced.
 */
export const submitFacilityAmendmentsToApimGift = async ({
  amendment,
  ukefFacilityId,
}: SubmitFacilityAmendmentToApimGiftParams): Promise<SubmitFacilityAmendmentToApimGiftResponse> => {
  const payloads = APIM_GIFT_PAYLOADS.amendFacility(amendment);

  if (!payloads.length) {
    return false;
  }

  const api = apiModule as ApiTypes;

  const responses: Array<object | false> = [];

  /**
   * NOTE: We need to use a for loop instead of Promise.all, to ensure that the calls are sequential.
   * Promise.all is not sequential.
   * If the calls are not sequential, GIFT will error with a database deadlock error.
   */
  for (const payload of payloads) {
    const response = await api.amendGiftFacility(payload, ukefFacilityId);

    responses.push(response);
  }

  return responses;
};
