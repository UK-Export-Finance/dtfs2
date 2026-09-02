import { isTfmApimGiftIntegrationEnabled, TfmDeal, TfmFacility } from '@ukef/dtfs2-common';
import apiModule from '../../../api';
import { mapFacilitiesToSendToGift } from '../map-facilities-to-send-to-gift';
import { ApiTypes } from '../../../mappings/apim-gift-payloads/types';
import { generateIssuedFacilitiesQueryString } from '../generate-issued-facilities-query-string';
import { getUrnAndDealFlags } from './get-urn-and-deal-flags';

type CanSubmitFacilitiesToApimGiftReturnShape = {
  canSendFacilitiesToApimGift: boolean;
  issuedFacilities?: TfmFacility[];
  isBssEwcsDeal?: boolean;
  isGefDeal?: boolean;
};

/**
 * Determines if a deal can be sent to APIM/GIFT based on its type, submission type, and issued facilities.
 * If the deal is BSS/EWCS, a buyer party URN must be populated.
 * Checks if the APIM/GIFT integration is enabled, then evaluates the deal's type and submission type.
 * If the deal is of a valid type and submission type, it retrieves the facilities associated with the deal,
 * filters for issued facilities, and determines if there are any that can be sent to APIM/GIFT.
 * @param {TfmDeal} deal - The TFM deal object to evaluate.
 * @returns {CanSubmitFacilitiesToApimGiftReturnShape} An object indicating whether the deal can be sent and relevant details.
 */
export const canSendToApimGift = async (deal: TfmDeal): Promise<CanSubmitFacilitiesToApimGiftReturnShape> => {
  const dealId = String(deal?._id);

  console.info('Checking if issued facilities for deal %s can be sent to APIM GIFT', dealId);

  if (!isTfmApimGiftIntegrationEnabled()) {
    console.info('Issued facilities for deal %s cannot be sent to APIM GIFT - feature flag disabled', dealId);

    return {
      canSendFacilitiesToApimGift: false,
    };
  }

  const api = apiModule as ApiTypes;

  const { hasExporterCreditRating, isBssEwcsDeal, isGefDeal, isValidBssEwcsDeal, isValidGefDeal, validDealType, validSubmissionType } =
    getUrnAndDealFlags(deal);

  if (!validDealType || !validSubmissionType || !hasExporterCreditRating) {
    console.info('Issued facilities for deal %s cannot be sent to APIM GIFT - invalid deal type, submission type, or missing exporter credit rating', dealId);

    return {
      canSendFacilitiesToApimGift: false,
    };
  }

  if (!isValidBssEwcsDeal && !isValidGefDeal) {
    console.info('Issued facilities for deal %s cannot be sent to APIM GIFT - invalid BSS/EWCS or GEF deal', dealId);

    return {
      canSendFacilitiesToApimGift: false,
    };
  }

  let facilities: TfmFacility[] = [];
  let findFacilitiesByDealIdFailed = false;

  try {
    // Get TFM facilities by deal ID.
    const response = await api.findFacilitiesByDealId(dealId);

    facilities = Array.isArray(response) ? response : [];
  } catch {
    // Swallow errors and default facilities to an empty array
    findFacilitiesByDealIdFailed = true;
    facilities = [];
  }

  let issuedFacilities: TfmFacility[] = [];

  if (Array.isArray(facilities)) {
    issuedFacilities = facilities.filter((facility) => Boolean(facility.facilitySnapshot?.hasBeenIssued));
  }

  const validCoreChecks = validDealType && validSubmissionType && issuedFacilities.length > 0;

  if (!validCoreChecks) {
    if (findFacilitiesByDealIdFailed) {
      console.info('Issued facilities for deal %s cannot be sent to APIM GIFT - failed to retrieve facilities from TFM', dealId);
    } else {
      console.info('Issued facilities for deal %s cannot be sent to APIM GIFT - no issued facilities', dealId);
    }

    return {
      canSendFacilitiesToApimGift: false,
      issuedFacilities: [],
      isBssEwcsDeal,
      isGefDeal,
    };
  }

  console.info('Issued facilities for deal %s could be sent to APIM GIFT', dealId);

  const issuedFacilitiesQueryString = generateIssuedFacilitiesQueryString(issuedFacilities);

  const giftFacilitiesResponse = await api.findGiftFacilitiesByIds(issuedFacilitiesQueryString);

  if (giftFacilitiesResponse === false) {
    console.info('Issued facilities for deal %s cannot be sent to APIM GIFT - failed to retrieve existing facilities from GIFT', dealId);

    return {
      canSendFacilitiesToApimGift: false,
      issuedFacilities: [],
      isBssEwcsDeal,
      isGefDeal,
    };
  }

  const giftFacilities = Array.isArray(giftFacilitiesResponse.facilities) ? giftFacilitiesResponse.facilities : [];

  const { facilitiesToSendToApimGift, facilityIds } = mapFacilitiesToSendToGift({
    dealId,
    giftFacilities,
    issuedTfmFacilities: issuedFacilities,
  });

  if (facilitiesToSendToApimGift.length === 0) {
    console.info('No issued facilities for deal %s can be sent to APIM GIFT - facilities already exist in GIFT', dealId);
  } else {
    const facilityIdsForLog = facilityIds ?? generateIssuedFacilitiesQueryString(facilitiesToSendToApimGift);

    console.info('Issued facilities %s for deal %s can be sent to APIM GIFT', facilityIdsForLog, dealId);
  }

  return {
    canSendFacilitiesToApimGift: facilitiesToSendToApimGift.length > 0,
    issuedFacilities: facilitiesToSendToApimGift,
    isBssEwcsDeal,
    isGefDeal,
  };
};
