import { HttpStatusCode } from 'axios';
import apiModule from '../../../api';
import { ApimGiftFacilityAmendmentPayload, ApiTypes } from '../../../mappings/apim-gift-payloads/types';

type SubmitFacilityAmendmentToApimGiftParams = {
  amendmentPayloads: ApimGiftFacilityAmendmentPayload[];
  ukefFacilityId: string;
};

type SubmitFacilityAmendmentToApimGiftResponse = number[] | false;

/**
 * Submits facility amendments to APIM/GIFT.
 * The function takes an array of amendment payloads and the UKEF facility ID, and submits each payload sequentially to the APIM/GIFT integration using the amendGiftFacility API call.
 * If any of the payloads cannot be submitted (i.e., if any call does not return an HTTP 202 Accepted status), the function returns false. Otherwise, it returns an array of the HTTP status codes received from APIM/GIFT for each submitted amendment.
 *
 * Each payload is sent to APIM/GIFT sequentially to avoid database deadlock errors in GIFT.
 * @param {SubmitFacilityAmendmentToApimGiftParams} params - The parameters for submitting the facility amendment.
 * @param {TfmFacilityAmendmentData} params.amendment - The facility amendment data from TFM.
 * @param {string} params.ukefFacilityId - The UKEF facility ID.
 * @returns {Promise<SubmitFacilityAmendmentToApimGiftResponse>} The array of responses from the APIM/GIFT system, or false if no valid payloads can be produced or any APIM/GIFT submission is not accepted
 */
export const submitFacilityAmendmentsToApimGift = async ({
  amendmentPayloads,
  ukefFacilityId,
}: SubmitFacilityAmendmentToApimGiftParams): Promise<SubmitFacilityAmendmentToApimGiftResponse> => {
  const api = apiModule as ApiTypes;

  const responses: number[] = [];

  console.info('Sending facility %s amendment(s) to APIM GIFT', ukefFacilityId);

  /**
   * NOTE: We need to use a for loop instead of Promise.all, to ensure that the calls are sequential.
   * Promise.all is not sequential.
   * If the calls are not sequential, GIFT will error with a database deadlock error.
   */
  for (const payload of amendmentPayloads) {
    const response = await api.amendGiftFacility(payload, ukefFacilityId);

    if (response !== HttpStatusCode.Accepted) {
      return false;
    }

    responses.push(response);
  }

  return responses;
};
