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

const updateAcbs = async (dealId, acbs) => {
  const acbsUpdate = {
    tfm: {
      acbs,
    },
  };

  const updatedDeal = await api.updateDeal(dealId, acbsUpdate);
  return updatedDeal;
};
exports.updateAcbs = updateAcbs;

const updateFacilityAcbs = async (facilityId, acbs) => {
  const updatedFacility = await api.updateFacility(facilityId, { acbs });
  return updatedFacility.tfm;
};
exports.updateFacilityAcbs = updateFacilityAcbs;
