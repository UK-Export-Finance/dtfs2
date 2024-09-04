import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { testApi } from '../test-api';

const createFacility = async ({ facility, user }) => {
  const auditDetails = generatePortalAuditDetails(user._id);
  const { body, status } = await testApi.post({ facility, user, auditDetails }).to('/v1/portal/facilities');
  return { auditDetails, body, status };
};

export { createFacility };
