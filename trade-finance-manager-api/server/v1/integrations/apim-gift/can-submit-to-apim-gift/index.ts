import { DEAL_SUBMISSION_TYPE, isTfmApimGiftIntegrationEnabled, TfmDeal, TfmFacility } from '@ukef/dtfs2-common';
import apiModule from '../../../api';
import { getDealTypeFlags } from '../../../mappings/apim-gift-payloads/create-facility/get-deal-type-flags';
import { ApiTypes } from '../../../mappings/apim-gift-payloads/types';

const { AIN, MIN } = DEAL_SUBMISSION_TYPE;

type CanSubmitFacilitiesToApimGiftReturnShape = {
  canSubmitFacilitiesToApimGift: boolean;
  issuedFacilities?: TfmFacility[];
  isBssEwcsDeal?: boolean;
  isGefDeal?: boolean;
};

/**
 * Determines if a deal can be submitted to APIM/GIFT based on its type, submission type, and issued facilities.
 * If the deal is BSS/EWCS, a buyer party URN must be populated.
 * Checks if the APIM/GIFT integration is enabled, then evaluates the deal's type and submission type.
 * If the deal is of a valid type and submission type, it retrieves the facilities associated with the deal,
 * filters for issued facilities, and determines if there are any that can be submitted to APIM/GIFT.
 * @param {TfmDeal} deal - The TFM deal object to evaluate.
 * @returns {CanSubmitFacilitiesToApimGiftReturnShape} An object indicating whether the deal can be submitted and relevant details.
 */
export const canSubmitToApimGift = async (deal: TfmDeal): Promise<CanSubmitFacilitiesToApimGiftReturnShape> => {
  const api = apiModule as ApiTypes;

  if (isTfmApimGiftIntegrationEnabled()) {
    const { dealType, submissionType } = deal.dealSnapshot;

    const { isBssEwcsDeal, isGefDeal } = getDealTypeFlags(dealType);

    const validDealType = isBssEwcsDeal || isGefDeal;
    const validSubmissionType = submissionType === AIN || submissionType === MIN;

    if (!validDealType || !validSubmissionType) {
      return {
        canSubmitFacilitiesToApimGift: false,
      };
    }

    const isValidBssEwcsDeal = isBssEwcsDeal && Boolean(deal.tfm.parties.buyer?.partyUrn);

    if (!isValidBssEwcsDeal && !isGefDeal) {
      return {
        canSubmitFacilitiesToApimGift: false,
      };
    }

    let facilities: TfmFacility[] = [];

    try {
      facilities = await api.findFacilitiesByDealId(deal._id.toString());
    } catch {
      // Swallow errors and default facilities to an empty array
      facilities = [];
    }

    let issuedFacilities: TfmFacility[] = [];

    if (Array.isArray(facilities)) {
      issuedFacilities = facilities.filter((facility) => Boolean(facility.facilitySnapshot?.hasBeenIssued));
    }

    const canSubmitFacilitiesToApimGift = validDealType && validSubmissionType && issuedFacilities.length > 0;

    return {
      canSubmitFacilitiesToApimGift,
      issuedFacilities,
      isBssEwcsDeal,
      isGefDeal,
    };
  }

  return {
    canSubmitFacilitiesToApimGift: false,
  };
};
