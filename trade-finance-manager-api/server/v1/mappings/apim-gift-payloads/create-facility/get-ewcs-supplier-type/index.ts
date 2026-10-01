import { BssEwcsDeal, TfmDeal } from '@ukef/dtfs2-common';

/**
 * Get the EWCS supplier type from a deal.
 *
 * @param deal - The deal from which to extract the EWCS supplier type.
 * @returns {string} The EWCS supplier type as a string.
 */
export const getEwcsSupplierType = (deal: TfmDeal) => {
  const ewcsDeal = deal.dealSnapshot as BssEwcsDeal;

  const supplierType = String(ewcsDeal.submissionDetails['supplier-type']);

  return supplierType;
};
