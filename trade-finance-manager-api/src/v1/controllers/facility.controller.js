const api = require('../api');
const dealController = require('./deal.controller');

const findOneFacility = async (_id) => {
  const facility = await api.findOneFacility(_id);

  return facility;
};

const updateTfmFacility = async (facilityId, tfmUpdate) => {
  // eslint-disable-next-line no-underscore-dangle
  const updatedFacility = await api.updateFacility(facilityId, tfmUpdate);
  await dealController.submitIfAllPartiesHaveUrn(updatedFacility.facilitySnapshot.associatedDealId);

  return updatedFacility;
};


module.exports = {
  findOneFacility,
  updateTfmFacility,
};
