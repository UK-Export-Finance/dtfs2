const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { testApi } = require('../test-api');

const createFacility = async ({ facility, user }) => {
  const auditDetails = generatePortalAuditDetails(user._id);
  const { body, status } = await testApi.post({ facility, user, auditDetails }).to('/v1/portal/facilities');
  return { auditDetails, body, status };
};

module.exports = { createFacility };
