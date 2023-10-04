const api = require('../api');
const { findOneTfmDeal } = require('./deal.controller');
const facilityMapper = require('../graphql-mappings/facility');

const getFacility = async (req, res) => {
  try {
    const { facilityId } = req.params;
    const facility = await api.findOneFacility(facilityId);

    const { dealId } = facility.facilitySnapshot;
    const deal = await findOneTfmDeal(dealId);

    const { dealSnapshot, tfm: dealTfm } = deal;
    const tfmFacility = facilityMapper(facility, dealSnapshot, dealTfm);

    return res.status(200).send({
      facility: tfmFacility
    });
  } catch (error) {
    console.error('Error fetching facility %O', error);
    return res.status(500).send(error.message);
  }
};

const updateFacility = async (req, res) => {
  const { facilityId } = req.params;
  const facilityUpdate = req.body;
  try {
    const updatedFacility = await api.updateFacility(facilityId, facilityUpdate);
    return res.status(200).send({
      updateFacility: updatedFacility.tfm
    });
  } catch (error) {
    console.error('Unable to update facility: %O', error);
    return res.status(400).send({ data: 'Unable to update facility' });
  }
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
  updateFacility,
  getAllFacilities,
  findOneFacility,
  updateTfmFacility,
  updateTfmFacilityRiskProfile,
};
