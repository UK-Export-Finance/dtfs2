const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { TestApi } = require('../test-api');

const createFacility = async ({ facility, user }) => {
  const auditDetails = generatePortalAuditDetails(user._id);
  const { body, status } = await TestApi.post({ facility, user, auditDetails }).to('/v1/portal/facilities');
  return { auditDetails, body, status };
};

module.exports = { createFacility };
