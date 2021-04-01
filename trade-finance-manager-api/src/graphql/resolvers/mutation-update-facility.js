const { updateTfmFacility } = require('../../v1/controllers/facility.controller');

const updateFacility = async ({ _id, facilityUpdate }) => {
  console.log('updateFacility', { facilityUpdate });
  const update = await updateTfmFacility(_id, facilityUpdate);
  return update;
};

module.exports = updateFacility;
