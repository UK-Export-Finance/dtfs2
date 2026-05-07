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

  // TODO: add logs. Checking If... Can submit. Cannot submit.

  if (isTfmApimGiftIntegrationEnabled()) {
    const { dealType, submissionType } = deal.dealSnapshot;

    const { isBssEwcsDeal, isGefDeal } = getDealTypeFlags(dealType);

    const validDealType = isBssEwcsDeal || isGefDeal;
    const validSubmissionType = submissionType === AIN || submissionType === MIN;

    /**
     * NOTE: During first BSS/EWCS/GEF deal submission, deal.tfm.exporterCreditRating will never exist.
     * This is only populated when a TFM Underwriter user adds a credit rating via the "Underwriting" section of a TFM deal.
     *
     * BSS/EWCS/GEF should only send facilities to APIM/GIFT if the buyer party URN is populated.
     *
     * Therefore, for the first submission of a BSS/EWCS deal, we should return canSubmitFacilitiesToApimGift as false.
     */
    const hasExporterCreditRating = Boolean(deal.tfm?.exporterCreditRating);

    if (!validDealType || !validSubmissionType || !hasExporterCreditRating) {
      return {
        canSubmitFacilitiesToApimGift: false,
      };
    }

    /**
     * NOTE: During first BSS/EWCS deal submission, tfm.parties.buyer?.partyUrn will always be an empty string.
     *
     * The buyer party URN is populated in TFM - after the first deal submission.
     * BSS/EWCS should only send facilities to APIM/GIFT if the buyer party URN is populated.
     *
     * Therefore, for the first submission of a BSS/EWCS deal, we should return canSubmitFacilitiesToApimGift as false.
     * For GEF deals, there is no requirement for a buyer party URN to be populated to submit facilities to APIM/GIFT, so GEF deals can submit facilities on the first submission.
     * This is an edge case but this is future proofed, and is important to prevent attempts to submit facilities to APIM/GIFT when the buyer party URN is not populated as this will cause errors in the APIM/GIFT integration.
     * Once the buyer party URN is populated after the first submission, BSS/EWCS deals can submit facilities to APIM/GIFT on subsequent submissions as normal.
     */
    const hasBuyerPartyUrn = Boolean(deal.tfm.parties.buyer?.partyUrn);

    const isValidBssEwcsDeal = isBssEwcsDeal && hasBuyerPartyUrn;

    if (!isValidBssEwcsDeal && !isGefDeal) {
      return {
        canSubmitFacilitiesToApimGift: false,
      };
    }

    let facilities: TfmFacility[] = [];

    try {
      const dealId = deal._id.toString();

      const response = await api.findFacilitiesByDealId(dealId);

      facilities = Array.isArray(response) ? response : [];
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
