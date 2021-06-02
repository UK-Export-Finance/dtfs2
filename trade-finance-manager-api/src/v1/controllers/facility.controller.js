const api = require('../api');
const dealController = require('./deal.controller');

const findOneFacility = async (_id) => {
  const facility = await api.findOneFacility(_id);

  return facility;
};

// TODO: rename this as it's only used in certain scenario
// don't want to call 'submitACBSIfAllPartiesHaveUrn' for generic facility update
const updateTfmFacility = async (facilityId, tfmUpdate) => {
  // eslint-disable-next-line no-underscore-dangle
  const updatedFacility = await api.updateFacility(facilityId, tfmUpdate);

  await dealController.submitACBSIfAllPartiesHaveUrn(updatedFacility.facilitySnapshot.associatedDealId);

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
