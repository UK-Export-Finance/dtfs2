const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');

const createDeal = async ({ api, deal, user }) => {
  const auditDetails = generatePortalAuditDetails(user._id);
  const { body, status } = await api.post({ deal, user, auditDetails }).to('/v1/portal/deals');
  return { auditDetails, body, status };
};

module.exports = { createDeal };
