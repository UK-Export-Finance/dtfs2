import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';

export const createDeal = async ({ api, deal, user }) => {
  return api.post({ deal, user, auditDetails: generatePortalAuditDetails(user._id) }).to('/v1/portal/deals');
};
