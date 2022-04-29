const api = require('../api');

const createFacilityAmendment = async (req, res) => {
  const { facilityId } = req.body;
  const { amendmentId } = await api.createFacilityAmendment(facilityId);
  if (amendmentId) {
    return res.status(200).send({ amendmentId });
  }
  return res.status(422).send({ message: 'Unable to create amendment' });
};

const updateFacilityAmendment = async (req, res) => {
  const { amendmentId, facilityId } = req.params;
  const payload = req.body;
  const createdAmendment = await api.updateFacilityAmendment(facilityId, amendmentId, payload);
  if (createdAmendment) {
    return res.status(200).send(createdAmendment);
  }
  return res.status(422).send({ message: 'Unable to update amendment' });
};

const getAmendmentInProgress = async (req, res) => {
  const { facilityId } = req.params;
  const amendment = await api.getAmendmentInProgress(facilityId);
  if (amendment) {
    return res.status(200).send(amendment);
  }
  return res.status(422).send({ message: 'Unable to get amendment in progress' });
};

module.exports = {
  createFacilityAmendment,
  updateFacilityAmendment,
  getAmendmentInProgress,
};
