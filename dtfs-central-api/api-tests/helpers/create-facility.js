const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');

const createFacility = async ({ api, facility, user }) => {
  const auditDetails = generatePortalAuditDetails(user._id);
  const { body, status } = await api.post({ facility, user, auditDetails }).to('/v1/portal/facilities');
  return { auditDetails, body, status };
};

module.exports = { createFacility };
