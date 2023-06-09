const app = require('../../../src/createApp');
const api = require('../../api')(app);

const updateFacilityAmendment = (facilityId, amendmentId, amendment) => api.put(amendment).to(`/v1/facilities/${facilityId}/amendments/${amendmentId}`);

module.exports = updateFacilityAmendment;
