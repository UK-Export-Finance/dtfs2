import { Deal, DEAL_STATUS, TFM_DEAL_STAGE, TfmDeal } from '@ukef/dtfs2-common';

export const mergeTfmValuesIntoPortalDeal = (portalDeal: Deal, tfmDeal: TfmDeal | null): Deal => {
  return {
    ...portalDeal,
    status: tfmDeal?.tfm?.stage === TFM_DEAL_STAGE.CANCELLED ? DEAL_STATUS.CANCELLED : portalDeal.status,
  };
};
