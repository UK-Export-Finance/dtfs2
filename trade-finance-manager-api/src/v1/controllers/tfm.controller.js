const activity = require('../helpers/activity');
const api = require('../api');

const updateTfmParty = async (dealId, tfmUpdate) => {
  const partyUpdate = {
    tfm: {
      parties: tfmUpdate,
    },
  };

  const updatedDeal = await api.updateDeal(dealId, partyUpdate);
  return updatedDeal;
};
exports.updateTfmParty = updateTfmParty;

const updateAcbs = async (taskOutput) => {
  const { ...dealAcbs } = taskOutput;
  // Add various ACBS records to the TFM activites
  const activities = await activity.add(taskOutput);
  const acbsUpdate = {
    tfm: {
      acbs: dealAcbs,
      activities,
    },
  };

  const updatedDeal = await api.updateDeal(taskOutput.portalDealId, acbsUpdate);
  return updatedDeal;
};
exports.updateAcbs = updateAcbs;

const updateFacilityAcbs = async (facilityId, acbs) => {
  const updatedFacility = await api.updateFacility(facilityId, { acbs });
  return updatedFacility.tfm;
};
exports.updateFacilityAcbs = updateFacilityAcbs;
