import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { testApi } from '../test-api';

const createDeal = async ({ deal, user }) => {
  const auditDetails = generatePortalAuditDetails(user._id);
  const { body, status } = await testApi.post({ deal, user, auditDetails }).to('/v1/portal/deals');
  return { auditDetails, body, status };
};

export { createDeal };
