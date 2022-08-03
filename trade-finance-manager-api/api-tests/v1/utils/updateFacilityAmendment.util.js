const app = require('../../../src/createApp');
const api = require('../../api')(app);

const updateFacilityAmendment = async (facilityId, amendmentId, amendment) => api.put(amendment).to(`/v1/facility/${facilityId}/amendment/${amendmentId}`);

module.exports = updateFacilityAmendment;
