const { MandatoryCriteria } = require('../gef/models/mandatoryCriteria');
const api = require('../api');
const { DEAL_TYPE: { GEF, BSS_EWCS } } = require('../../constants/deal');

exports.postMandatoryCriteria = async (req, res) => {
  const { data: mandatoryCriteria } = await api.postMandatoryCriteria(new MandatoryCriteria(req.body), GEF);
  return res.status(201).send(mandatoryCriteria);
};

exports.findAllMandatoryCriteria = async (req, res) => {
  const { data, status } = await api.findAllMandatoryCriteria(GEF);
  if (status === 200) {
    return res.status(status).send(data);
  }
  return res.status(status).send();
};

exports.findOneMandatoryCriteria = async (req, res) => {
  const { version } = req.params;
  const { data, status } = await api.findOneMandatoryCriteria(version, GEF);
  if (status === 200) {
    return res.status(status).send(data);
  }
  return res.status(status).send();
};

exports.findLatestMandatoryCriteria = async (req, res) => {
  const { data, status } = await api.findLatestMandatoryCriteria(GEF);
  if (status === 200) {
    return res.status(status).send(data);
  }
  return res.status(status).send();
};

exports.putMandatoryCriteria = async (req, res) => {
  const payload = req.body;
  const { version } = req.params;
  payload.updatedAt = Date.now();
  const { data, status } = await api.putMandatoryCriteria(payload, version, GEF);
  if (status === 200) {
    return res.status(status).send(data);
  }
  return res.status(status).send();
};

exports.deleteMandatoryCriteria = async (req, res) => {
  const { version } = req.params;
  const { data, status } = await api.deleteMandatoryCriteria(version, GEF);
  if (status === 200) {
    return res.status(status).send(data);
  }
  return res.status(status).send();
};

// BSS/EWCS section
exports.postBssMandatoryCriteria = async (req, res) => {
  const { data, status } = await api.postMandatoryCriteria(req.body, BSS_EWCS);
  if (status === 200) {
    return res.status(status).send(data);
  }
  return res.status(status).send();
};

exports.findAllBssMandatoryCriteria = async (req, res) => {
  const { data, status } = await api.findAllMandatoryCriteria(BSS_EWCS);
  if (status === 200) {
    return res.status(status).send(data);
  }
  return res.status(status).send();
};

exports.findOneBssMandatoryCriteria = async (req, res) => {
  const { version } = req.params;
  const { data, status } = await api.findOneMandatoryCriteria(version, BSS_EWCS);
  if (status === 200) {
    return res.status(status).send(data);
  }
  return res.status(status).send();
};

exports.findLatestBssMandatoryCriteria = async (req, res) => {
  const { data, status } = await api.findLatestMandatoryCriteria(BSS_EWCS);
  if (status === 200) {
    return res.status(status).send(data);
  }
  return res.status(status).send();
};

exports.putBssMandatoryCriteria = async (req, res) => {
  const { data, status } = await api.putMandatoryCriteria(req.body, req.params.version, BSS_EWCS);
  if (status === 200) {
    return res.status(status).send(data);
  }
  return res.status(status).send();
};

exports.deleteBssMandatoryCriteria = async (req, res) => {
  const { data, status } = await api.deleteMandatoryCriteria(req.params.version, BSS_EWCS);
  if (status === 200) {
    return res.status(status).send(data);
  }
  return res.status(status).send();
};
