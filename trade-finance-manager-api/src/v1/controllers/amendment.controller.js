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

const getCompletedAmendment = async (req, res) => {
  const { facilityId } = req.params;
  const amendment = await api.getCompletedAmendment(facilityId);
  if (amendment) {
    return res.status(200).send(amendment);
  }
  return res.status(422).send({ message: 'Unable to get the completed amendment' });
};

const getLatestCompletedAmendment = async (req, res) => {
  const { facilityId } = req.params;
  const amendment = await api.getLatestCompletedAmendment(facilityId);
  if (amendment) {
    return res.status(200).send(amendment);
  }
  return res.status(422).send({ message: 'Unable to get the latest completed amendment' });
};

const getAmendmentById = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const amendment = await api.getAmendmentById(facilityId, amendmentId);
  if (amendment) {
    return res.status(200).send(amendment);
  }
  return res.status(422).send({ message: 'Unable to get the amendment by Id' });
};

const getAmendmentByFacilityId = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const amendment = await api.getAmendmentByFacilityId(facilityId, amendmentId);
  if (amendment) {
    return res.status(200).send(amendment);
  }
  return res.status(422).send({ message: 'Unable to get the amendment by facilityId' });
};

const getAmendmentByDealId = async (req, res) => {
  const { dealId } = req.params;
  const amendment = await api.getAmendmentByDealId(dealId);
  if (amendment) {
    return res.status(200).send(amendment);
  }
  return res.status(422).send({ message: 'Unable to get the amendment by deal Id' });
};

const getAmendmentInProgressByDealId = async (req, res) => {
  const { dealId } = req.params;
  const amendment = await api.getAmendmentInProgressByDealId(dealId);
  if (amendment) {
    return res.status(200).send(amendment);
  }
  return res.status(422).send({ message: 'Unable to get the amendment in progress by deal Id' });
};

const getCompletedAmendmentByDealId = async (req, res) => {
  const { dealId } = req.params;
  const amendment = await api.getCompletedAmendmentByDealId(dealId);
  if (amendment) {
    return res.status(200).send(amendment);
  }
  return res.status(422).send({ message: 'Unable to get the completed amendment by deal Id' });
};

const getLatestCompletedAmendmentByDealId = async (req, res) => {
  const { dealId } = req.params;
  const amendment = await api.getLatestCompletedAmendmentByDealId(dealId);
  if (amendment) {
    return res.status(200).send(amendment);
  }
  return res.status(422).send({ message: 'Unable to get the latest completed amendment by deal Id' });
};

module.exports = {
  createFacilityAmendment,
  updateFacilityAmendment,
  getAmendmentInProgress,
  getCompletedAmendment,
  getLatestCompletedAmendment,
  getAmendmentById,
  getAmendmentByFacilityId,
  getAmendmentByDealId,
  getAmendmentInProgressByDealId,
  getCompletedAmendmentByDealId,
  getLatestCompletedAmendmentByDealId,
};
