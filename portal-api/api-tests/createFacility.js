const app = require('../src/createApp');
const { as } = require('./api')(app);

const createFacility = async (user, dealId, newFacility) => {
  const { facilityType } = newFacility;

  if (facilityType === 'loan') {
    const response = await as(user).put(newFacility).to(`/v1/deals/${dealId}/loan/create`);

    return response.body;
  } else if (facilityType === 'bond') {
    const response = await as(user).put(newFacility).to(`/v1/deals/${dealId}/bond/create`);

    return response.body;
  }
};

module.exports = createFacility;
