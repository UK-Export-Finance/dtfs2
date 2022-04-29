const api = require('../api');

const createFacilityAmendment = async (req, res) => {
  const { facilityId } = req.body;
  const { amendmentId } = await api.createFacilityAmendment(facilityId);
  return res.status(200).send({ amendmentId });
};

const updateFacilityAmendment = async (req, res) => {
  const { amendmentId, facilityId } = req.params;
  const payload = req.body;
  const createdAmendment = await api.updateFacilityAmendment(facilityId, amendmentId, payload);
  return res.status(200).send(createdAmendment);
};

const getAmendmentInProgress = async (req, res) => {
  const { facilityId } = req.params;
  const amendment = await api.getAmendmentInProgress(facilityId);
  return res.status(200).send(amendment);
};

module.exports = {
  createFacilityAmendment,
  updateFacilityAmendment,
  getAmendmentInProgress,
};
