const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');

const createDeal = async ({ api, deal, user }) => {
  return api.post({ deal, user, auditDetails: generatePortalAuditDetails(user._id) }).to('/v1/portal/deals');
};

module.exports = { createDeal };
