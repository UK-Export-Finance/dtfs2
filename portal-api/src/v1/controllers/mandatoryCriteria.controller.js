const { MandatoryCriteria } = require('../gef/models/mandatoryCriteria');
const api = require('../api');
const { DEAL_TYPE } = require('../../constants/deal');

exports.postMandatoryCriteria = async (req, res) => {
  const { data: mandatoryCriteria } = await api.postMandatoryCriteria(new MandatoryCriteria(req.body), DEAL_TYPE.GEF);
  res.status(201).send({ _id: mandatoryCriteria._id });
};

exports.findAllMandatoryCriteria = async (req, res) => {
  const { data: criteria, status } = await api.findAllMandatoryCriteria(DEAL_TYPE.GEF);
  if (status === 200) {
    return res.status(200).send(criteria);
  }
  return res.status(status).send();
};

exports.findOneMandatoryCriteria = async (req, res) => {
  const { id } = req.params;
  const criteria = await api.findOneMandatoryCriteria(id, DEAL_TYPE.GEF);
  if (criteria.status === 200) {
    return res.status(200).send(criteria.data);
  }
  return res.status(criteria.status).send();
};

exports.findLatestMandatoryCriteria = async (req, res) => {
  const criteria = await api.findLatestMandatoryCriteria(DEAL_TYPE.GEF);
  if (criteria.status === 200) {
    return res.status(200).send(criteria.data);
  }
  return res.status(criteria.status).send();
};

exports.putMandatoryCriteria = async (req, res) => {
  const update = req.body;
  update.updatedAt = Date.now();
  const criteria = await api.putMandatoryCriteria(update, req.params.id, DEAL_TYPE.GEF);
  if (criteria.status === 200) {
    return res.status(200).send(criteria.data);
  }
  return res.status(criteria.status).send();
};

exports.deleteMandatoryCriteria = async (req, res) => {
  const criteria = await api.deleteMandatoryCriteria(req.params.id, DEAL_TYPE.GEF);
  if (criteria.status === 200) {
    return res.status(200).send(criteria.data);
  }
  return res.status(criteria.status).send();
};

// BSS/EWCS section
exports.postBssMandatoryCriteria = async (req, res) => {
  const { data: mandatoryCriteria } = await api.postMandatoryCriteria(req.body, DEAL_TYPE.BSS_EWCS);
  res.status(200).send(mandatoryCriteria);
};

exports.findAllBssMandatoryCriteria = async (req, res) => {
  const { data: criteria, status } = await api.findAllMandatoryCriteria(DEAL_TYPE.BSS_EWCS);
  if (status === 200) {
    return res.status(200).send(criteria);
  }
  return res.status(status).send();
};

exports.findOneBssMandatoryCriteria = async (req, res) => {
  const { version } = req.params;
  const criteria = await api.findOneMandatoryCriteria(version, DEAL_TYPE.BSS_EWCS);
  if (criteria.status === 200) {
    return res.status(200).send(criteria.data);
  }
  return res.status(criteria.status).send();
};

exports.findLatestBssMandatoryCriteria = async (req, res) => {
  const criteria = await api.findLatestMandatoryCriteria(DEAL_TYPE.BSS_EWCS);
  if (criteria.status === 200) {
    return res.status(200).send(criteria.data);
  }
  return res.status(criteria.status).send();
};

exports.putBssMandatoryCriteria = async (req, res) => {
  const criteria = await api.putMandatoryCriteria(req.body, req.params.version, DEAL_TYPE.BSS_EWCS);
  if (criteria.status === 200) {
    return res.status(200).send(criteria.data);
  }
  return res.status(criteria.status).send();
};

exports.deleteBssMandatoryCriteria = async (req, res) => {
  const criteria = await api.deleteMandatoryCriteria(req.params.version, DEAL_TYPE.BSS_EWCS);
  if (criteria.status === 200) {
    return res.status(200).send(criteria.data);
  }
  return res.status(criteria.status).send();
};
