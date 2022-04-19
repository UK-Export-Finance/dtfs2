const api = require('../api');

const findOneFacility = async (_id) => {
  const facility = await api.findOneFacility(_id);

  return facility;
};

const getAllFacilities = async (searchString) => {
  const allFacilities = await api.getAllFacilities(searchString);

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

const updateTfmFacilityAmendment = async (_id, amendmentUpdate) => {
  console.log('in tfm api update amendment create');
  const updatedAmendment = {
    tfm: {
      amendments: amendmentUpdate,
    },
  };
  const updatedFacility = await api.updateFacility(_id, updatedAmendment);
  return updatedFacility.tfm;
};

module.exports = {
  getAllFacilities,
  findOneFacility,
  updateTfmFacility,
  updateTfmFacilityRiskProfile,
  updateTfmFacilityAmendment,
};
