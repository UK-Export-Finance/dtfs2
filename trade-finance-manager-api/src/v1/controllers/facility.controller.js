const api = require('../api');
const { findOneTfmDeal } = require('./deal.controller');
const facilityReducer = require('../../graphql/reducers/facility');

const getFacility = async (req, res) => {
  const { facilityId } = req.params;
  const facility = await api.findOneFacility(facilityId);

  const { dealId } = facility.facilitySnapshot;
  const deal = await findOneTfmDeal(dealId);

  const { dealSnapshot, tfm: dealTfm } = deal;
  const tfmFacility = facilityReducer(facility, dealSnapshot, dealTfm);

  // add error handling
  return res.status(200).json({
    facility: tfmFacility
  });
};

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

module.exports = {
  getFacility,
  getAllFacilities,
  findOneFacility,
  updateTfmFacility,
  updateTfmFacilityRiskProfile,
};
