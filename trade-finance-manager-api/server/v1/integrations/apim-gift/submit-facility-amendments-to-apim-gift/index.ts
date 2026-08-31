import apiModule from '../../../api';
import { ApimGiftFacilityAmendmentPayload, ApiTypes } from '../../../mappings/apim-gift-payloads/types';

type SubmitFacilityAmendmentToApimGiftParams = {
  amendmentPayloads: ApimGiftFacilityAmendmentPayload[];
  ukefFacilityId: string;
};

type SubmitFacilityAmendmentToApimGiftResponse = number | false;

/**
 * Submits facility amendments to APIM/GIFT.
 * The function takes an array of amendment payloads and the UKEF facility ID, and submits each payload sequentially to the APIM/GIFT integration using the amendGiftFacility API call.
 * If any of the payloads cannot be submitted (i.e., if any call does not return an HTTP 202 Accepted status), the function returns false. Otherwise, it returns an array of the HTTP status codes received from APIM/GIFT for each submitted amendment.
 *
 * Each payload is sent to APIM/GIFT sequentially to avoid database deadlock errors in GIFT.
 * @param {SubmitFacilityAmendmentToApimGiftParams} params - The parameters for submitting the facility amendment.
 * @param {ApimGiftFacilityAmendmentPayload[]} params.amendmentPayloads - The APIM/GIFT amendment payloads to submit.
 * @param {string} params.ukefFacilityId - The UKEF facility ID.
 * @returns {Promise<SubmitFacilityAmendmentToApimGiftResponse>} The array of HTTP status codes returned by APIM/GIFT, or false if any APIM/GIFT submission is not accepted.
 */
export const submitFacilityAmendmentsToApimGift = async ({
  amendmentPayloads,
  ukefFacilityId,
}: SubmitFacilityAmendmentToApimGiftParams): Promise<SubmitFacilityAmendmentToApimGiftResponse> => {
  const api = apiModule as ApiTypes;

  if (amendmentPayloads.length === 1) {
    console.info('Sending facility %s single amendment to APIM GIFT %s', amendmentPayloads.length, ukefFacilityId);

    const payload = amendmentPayloads[0];

    const response = await api.amendGiftFacility(payload, ukefFacilityId);

    return response;
  }

  if (amendmentPayloads.length >= 2) {
    console.info('Sending facility %s multiple amendments to APIM GIFT %s', amendmentPayloads.length, ukefFacilityId);

    const payload = {
      amendments: amendmentPayloads,
    };

    const response = await api.multipleGiftFacilityAmendments(payload, ukefFacilityId);

    return response;
  }

  return false;
};
