import { DEAL_TYPE, DealType } from '@ukef/dtfs2-common';

type GetDealTypeFlagsReturnShape = {
  isBssEwcsDeal: boolean;
  isGefDeal: boolean;
};

/**
 * Return an object with BSS/GEF deal flags.
 * Avoids doing the same checks in other functions.
 * @param {DealType} dealType - The deal type
 * @returns {GetDealTypeFlagsReturnShape} BSS/GEF deal booleans
 */
export const getDealTypeFlags = (dealType: DealType): GetDealTypeFlagsReturnShape => ({
  isBssEwcsDeal: dealType === DEAL_TYPE.BSS_EWCS,
  isGefDeal: dealType === DEAL_TYPE.GEF,
});
