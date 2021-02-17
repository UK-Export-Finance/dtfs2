const api = require('../api');

const findOneFacility = async (_id) => {
  const facility = await api.findOneFacility(_id);

  return facility;
};

exports.findOneFacility = findOneFacility;

const updateTfmFacility = async (facilityId, tfmUpdate) => {
  console.log({ facilityId, tfmUpdate });
  // eslint-disable-next-line no-underscore-dangle
  const updatedFacility = await api.updateFacility(facilityId, tfmUpdate);
  return updatedFacility;
};
exports.updateTfmFacility = updateTfmFacility;
