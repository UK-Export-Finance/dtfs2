const activity = require('../helpers/activity');
const api = require('../api');

const updateTfmParty = async (dealId, tfmUpdate) => {
  const partyUpdate = {
    tfm: {
      parties: tfmUpdate,
    },
  };

  return api.updateDeal(dealId, partyUpdate);
};
exports.updateTfmParty = updateTfmParty;

const updateAcbs = async (taskOutput) => {
  const { ...dealAcbs } = taskOutput;
  // Add various ACBS records to the TFM activities
  const activities = await activity.add(taskOutput);
  const acbsUpdate = {
    tfm: {
      acbs: dealAcbs,
      activities,
    },
  };

  return api.updateDeal(taskOutput.portalDealId, acbsUpdate);
};
exports.updateAcbs = updateAcbs;

const updateFacilityAcbs = async (facilityId, acbs) => {
  const updatedFacility = await api.updateFacility(facilityId, { acbs });
  // TFM - Update Facility Activity : MVP2
  return updatedFacility.tfm;
};
exports.updateFacilityAcbs = updateFacilityAcbs;
