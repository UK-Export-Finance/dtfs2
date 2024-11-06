import { Deal, DEAL_STATUS, TFM_DEAL_STAGE, TfmDeal } from '@ukef/dtfs2-common';

/**
 * Updates properties on a portal deal with updates from tfm
 * @param portalDeal the portal deal returned from the database
 * @param tfmDeal the tfm deal if it exists
 * @returns portal `deal` object with relevant fields from tfm-deals added in
 */
export const mergeTfmValuesIntoPortalDeal = (portalDeal: Deal, tfmDeal: TfmDeal | null): Deal => {
  return {
    ...portalDeal,
    status: tfmDeal?.tfm?.stage === TFM_DEAL_STAGE.CANCELLED ? DEAL_STATUS.CANCELLED : portalDeal.status,
  };
};
