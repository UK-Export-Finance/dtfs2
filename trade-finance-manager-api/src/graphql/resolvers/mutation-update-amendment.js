const { updateTfmFacilityAmendment } = require('../../v1/controllers/facility.controller');

const createAmendment = async ({ _id, amendmentUpdate }) => updateTfmFacilityAmendment(_id, amendmentUpdate);

module.exports = createAmendment;
