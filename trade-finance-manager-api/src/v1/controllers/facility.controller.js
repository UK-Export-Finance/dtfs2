const api = require('../api');

const findOneFacility = async (_id) => {
  const facility = await api.findOneFacility(_id);

  return facility;
};

const getAllFacilities = async () => {
  const allFacilities = await api.getAllFacilities();

  return allFacilities;
};

const updateTfmFacility = async (facilityId, tfmUpdate) => {
  const updatedFacility = await api.updateFacility(facilityId, tfmUpdate);

  return updatedFacility.tfm;
};

const updateTfmFacilityRiskProfile = async (facilityId, tfmUpdate) => {
  const updatedFacility = await api.updateFacility(facilityId, tfmUpdate);

  return updatedFacility.tfm;
};

module.exports = {
  getAllFacilities,
  findOneFacility,
  updateTfmFacility,
  updateTfmFacilityRiskProfile,
};
