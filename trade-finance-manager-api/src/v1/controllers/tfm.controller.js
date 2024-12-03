const { generateSystemAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const activity = require('../helpers/activity');
const api = require('../api');

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

  return api.updateDeal({
    dealId: taskOutput.portalDealId,
    dealUpdate: acbsUpdate,
    auditDetails: generateSystemAuditDetails(),
  });
};
exports.updateAcbs = updateAcbs;

const updateFacilityAcbs = async (facilityId, acbs) => {
  const updatedFacility = await api.updateFacility({
    facilityId,
    tfmUpdate: { acbs },
    auditDetails: generateSystemAuditDetails(),
  });
  // TFM - Update Facility Activity : MVP2
  return updatedFacility.tfm;
};
exports.updateFacilityAcbs = updateFacilityAcbs;
