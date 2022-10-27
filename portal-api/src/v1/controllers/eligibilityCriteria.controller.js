const api = require('../api');
const { DEAL_TYPE: { GEF, BSS_EWCS } } = require('../../constants/deal');
const { EligibilityCriteria } = require('../gef/models/eligibilityCriteria');

exports.postEligibilityCriteria = async (req, res) => {
  const { data: mandatoryCriteria } = await api.postEligibilityCriteria(new EligibilityCriteria(req.body), GEF);
  return res.status(201).send(mandatoryCriteria);
};

exports.findAllEligibilityCriteria = async (req, res) => {
  const { data, status } = await api.findAllEligibilityCriteria(GEF);
  if (status === 200) {
    return res.status(status).send(data);
  }
  return res.status(status).send();
};

exports.findOneEligibilityCriteria = async (req, res) => {
  const { version } = req.params;
  const { data, status } = await api.findOneEligibilityCriteria(version, GEF);
  if (status === 200) {
    return res.status(status).send(data);
  }
  return res.status(status).send();
};

exports.findLatestEligibilityCriteria = async (req, res) => {
  const { data, status } = await api.findLatestEligibilityCriteria(GEF);
  if (status === 200) {
    return res.status(status).send(data);
  }
  return res.status(status).send();
};

exports.putEligibilityCriteria = async (req, res) => {
  const payload = req.body;
  const { version } = req.params;
  payload.updatedAt = Date.now();
  const { data, status } = await api.putEligibilityCriteria(payload, version, GEF);
  if (status === 200) {
    return res.status(status).send(data);
  }
  return res.status(status).send();
};

exports.deleteEligibilityCriteria = async (req, res) => {
  const { version } = req.params;
  const { data, status } = await api.deleteEligibilityCriteria(version, GEF);
  if (status === 200) {
    return res.status(status).send(data);
  }
  return res.status(status).send();
};

// BSS/EWCS section
exports.postBssEligibilityCriteria = async (req, res) => {
  const { data, status } = await api.postEligibilityCriteria(req.body, BSS_EWCS);
  if (status === 200) {
    return res.status(status).send(data);
  }
  return res.status(status).send();
};

exports.findAllBssEligibilityCriteria = async (req, res) => {
  const { data, status } = await api.findAllEligibilityCriteria(BSS_EWCS);
  if (status === 200) {
    return res.status(status).send(data);
  }
  return res.status(status).send();
};

exports.findOneBssEligibilityCriteria = async (req, res) => {
  const { version } = req.params;
  const { data, status } = await api.findOneEligibilityCriteria(version, BSS_EWCS);
  if (status === 200) {
    return res.status(status).send(data);
  }
  return res.status(status).send();
};

exports.findLatestBssEligibilityCriteria = async (req, res) => {
  const { data, status } = await api.findLatestEligibilityCriteria(BSS_EWCS);
  if (status === 200) {
    return res.status(status).send(data);
  }
  return res.status(status).send();
};

exports.putBssEligibilityCriteria = async (req, res) => {
  const { data, status } = await api.putEligibilityCriteria(req.body, req.params.version, BSS_EWCS);
  if (status === 200) {
    return res.status(status).send(data);
  }
  return res.status(status).send();
};

exports.deleteBssEligibilityCriteria = async (req, res) => {
  const { data, status } = await api.deleteEligibilityCriteria(req.params.version, BSS_EWCS);
  if (status === 200) {
    return res.status(status).send(data);
  }
  return res.status(status).send();
};
