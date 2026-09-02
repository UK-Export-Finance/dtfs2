import { TfmDeal } from '@ukef/dtfs2-common';
import { getDealTypeFlags } from '../../../../mappings/apim-gift-payloads/create-facility/get-deal-type-flags';
import { getUrnFlags } from './get-urn-flags';
import { isValidSubmissionType } from './is-valid-submission-type';

type GetUrnAndDealFlagsReturnShape = {
  hasExporterCreditRating: boolean;
  isBssEwcsDeal: boolean;
  isGefDeal: boolean;
  isValidBssEwcsDeal: boolean;
  isValidGefDeal: boolean;
  validDealType: boolean;
  validSubmissionType: boolean;
};

/**
 * Retrieves flags indicating the validity of the deal based on URNs, deal type, and submission type.
 *
 * 1) NOTE: Regarding buyer party URN.
 * During first BSS/EWCS deal submission, tfm.parties.buyer?.partyUrn will always be an empty string.
 *
 * The buyer party URN is populated in TFM - after the first deal submission.
 * BSS/EWCS should only send facilities to APIM/GIFT if the buyer party URN is populated.
 *
 * Therefore, for the first submission of a BSS/EWCS deal, isValidBssEwcsDeal will be returned as false.
 * For GEF deals, there is no requirement for a buyer party URN to be populated to submit facilities to APIM/GIFT, so GEF deals can submit facilities on the first submission.
 * This is an edge case but this is future proofed, and is important to prevent attempts to submit facilities to APIM/GIFT when the buyer party URN is not populated as this will cause errors in the APIM/GIFT integration.
 * Once the buyer party URN is populated after the first submission, BSS/EWCS deals can submit facilities to APIM/GIFT on subsequent submissions as normal.
 *
 * 2) NOTE: Regarding exporter credit rating.
 * During first BSS/EWCS/GEF deal submission, deal.tfm.exporterCreditRating will never exist.
 * This is only populated when a TFM Underwriter user adds a credit rating via the "Underwriting" section of a TFM deal.
 *
 * Therefore, for the first submission of a BSS/EWCS deal, isValidBssEwcsDeal will be returned as false.
 *
 * @param {TfmDeal} deal - The TFM deal object to evaluate.
 * @returns {GetUrnAndDealFlagsReturnShape} An object containing flags indicating the presence of URNs for different parties in the deal, as well as deal type and submission type validity.
 */
export const getUrnAndDealFlags = (deal: TfmDeal): GetUrnAndDealFlagsReturnShape => {
  const { dealType, submissionType } = deal.dealSnapshot;

  const { isBssEwcsDeal, isGefDeal } = getDealTypeFlags(dealType);

  const validDealType = isBssEwcsDeal || isGefDeal;
  const validSubmissionType = isValidSubmissionType(submissionType);

  /**
   * NOTE: During first BSS/EWCS/GEF deal submission, deal.tfm.exporterCreditRating will never exist.
   * This is only populated when a TFM Underwriter user adds a credit rating via the "Underwriting" section of a TFM deal.
   *
   * Therefore, for the first submission of a BSS/EWCS deal, isValidBssEwcsDeal will be returned as false.
   */
  const hasExporterCreditRating = Boolean(deal.tfm?.exporterCreditRating?.trim());

  const { hasBssEwcsUrns, hasGefUrns } = getUrnFlags(deal);

  const isValidBssEwcsDeal = Boolean(isBssEwcsDeal && hasBssEwcsUrns);
  const isValidGefDeal = Boolean(isGefDeal && hasGefUrns);

  return {
    hasExporterCreditRating,
    isBssEwcsDeal,
    isGefDeal,
    isValidBssEwcsDeal,
    isValidGefDeal,
    validDealType,
    validSubmissionType,
  };
};
