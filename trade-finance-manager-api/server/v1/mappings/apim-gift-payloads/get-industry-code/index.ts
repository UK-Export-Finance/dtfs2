import { TfmDeal, BssEwcsDeal, DEAL_TYPE, GefDeal } from '@ukef/dtfs2-common';

/**
 * Get the industry code from a given deal.
 * @param deal - The deal from which to get the industry code.
 * @returns The industry code if available, otherwise an empty string.
 */
export const getIndustryCode = (deal: TfmDeal): string => {
  const {
    dealSnapshot: { dealType },
  } = deal;

  if (dealType === DEAL_TYPE.BSS_EWCS) {
    const bssEwcsDeal = deal.dealSnapshot as BssEwcsDeal;

    return bssEwcsDeal.submissionDetails['industry-class']?.code || '';
  }

  if (dealType === DEAL_TYPE.GEF) {
    const gefDeal = deal.dealSnapshot as GefDeal;

    return gefDeal.exporter?.industries?.[0]?.class?.code || '';
  }

  return '';
};
