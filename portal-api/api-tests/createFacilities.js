const app = require('../src/createApp');
const { as } = require('./api')(app);

const createFacilities = async (user, dealId, facilities, auditDetails) => {
  const response = await as(user)
    .post({
      facilities,
      dealId,
      user,
      auditDetails,
    })
    .to(`/v1/deals/${dealId}/multiple-facilities`);
  return response.body;
};

module.exports = createFacilities;
