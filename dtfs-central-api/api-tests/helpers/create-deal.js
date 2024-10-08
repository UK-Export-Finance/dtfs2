const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { testApi } = require('../test-api');

const createDeal = async ({ deal, user }) => {
  const auditDetails = generatePortalAuditDetails(user._id);
  const { body, status } = await testApi.post({ deal, user, auditDetails }).to('/v1/portal/deals');
  return { auditDetails, body, status };
};

module.exports = { createDeal };
