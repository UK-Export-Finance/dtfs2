const api = require('../api');

const findOneFacility = async (_id) => {
  const facility = await api.findOneFacility(_id);

  const testing = await api.getCurrencyExchangeRate();
  console.log('facility called ref.data - test \n', testing);

  return facility;
};

exports.findOneFacility = findOneFacility;

const updateTfmFacility = async (facilityId, tfmUpdate) => {
  // eslint-disable-next-line no-underscore-dangle
  const updatedFacility = await api.updateFacility(facilityId, tfmUpdate);
  return updatedFacility;
};
exports.updateTfmFacility = updateTfmFacility;
