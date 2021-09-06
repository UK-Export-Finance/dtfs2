const api = require('../api');

const findOneFacility = async (_id) => {
  const facility = await api.findOneFacility(_id);

  return facility;
};

const updateTfmFacility = async (facilityId, tfmUpdate) => {
  // eslint-disable-next-line no-underscore-dangle
  const updatedFacility = await api.updateFacility(facilityId, tfmUpdate);

  return updatedFacility.tfm;
};

const updateTfmFacilityRiskProfile = async (facilityId, tfmUpdate) => {
  // eslint-disable-next-line no-underscore-dangle
  const updatedFacility = await api.updateFacility(facilityId, tfmUpdate);

  return updatedFacility.tfm;
};


module.exports = {
  findOneFacility,
  updateTfmFacility,
  updateTfmFacilityRiskProfile,
};
