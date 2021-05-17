const { updateTfmFacilityRiskProfile } = require('../../v1/controllers/facility.controller');

const updateFacilityRiskProfile = async ({ _id, facilityUpdate }) => {
  const update = await updateTfmFacilityRiskProfile(_id, facilityUpdate);
  return update;
};

module.exports = updateFacilityRiskProfile;
