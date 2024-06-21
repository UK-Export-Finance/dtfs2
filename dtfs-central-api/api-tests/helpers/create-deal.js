const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { TestApi } = require('../test-api');

const createDeal = async ({ deal, user }) => {
  const auditDetails = generatePortalAuditDetails(user._id);
  const { body, status } = await TestApi.post({ deal, user, auditDetails }).to('/v1/portal/deals');
  return { auditDetails, body, status };
};

module.exports = { createDeal };
