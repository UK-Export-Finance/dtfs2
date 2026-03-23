import { DEAL_TYPE, DealType } from '@ukef/dtfs2-common';

type GetDealTypeFlagsReturnShape = {
  isBssDeal: boolean;
  isGefDeal: boolean;
};

/**
 * Return an object with BSS/GEF deal flags.
 * Avoids doing the same checks in other functions.
 * @param dealType - The deal type
 * @returns {GetDealTypeFlagsReturnShape} BSS/GEF deal booleans
 */
export const getDealTypeFlags = (dealType: DealType): GetDealTypeFlagsReturnShape => ({
  isBssDeal: dealType === DEAL_TYPE.BSS_EWCS,
  isGefDeal: dealType === DEAL_TYPE.GEF,
});
