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

const createTfmFacilityAmendment = async (req, res) => {
  const amendments = {
    amendments: req.body.amendmentObj,
  };
  const createdAmendment = await api.createFacilityAmendment(req.body._id, amendments);

  return res.status(200).send(createdAmendment);
};

module.exports = {
  getAllFacilities,
  findOneFacility,
  updateTfmFacility,
  updateTfmFacilityRiskProfile,
  createTfmFacilityAmendment,
};
