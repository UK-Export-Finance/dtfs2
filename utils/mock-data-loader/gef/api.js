const axios = require('axios');
require('dotenv').config();

const portalApi = process.env.DEAL_API_URL;

const createApplication = async (data, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${portalApi}/v1/gef/application`,
    data,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

const updateApplication = async (id, data, token) => {
  const response = await axios({
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${portalApi}/v1/gef/application/${id}`,
    data,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

const listDeals = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${portalApi}/v1/gef/application`,
  }).catch((err) => { console.error(`err: ${err}`); });
  return response.data.items;
};

const createFacilities = async (data, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${portalApi}/v1/gef/facilities`,
    data,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};
const updateFacilities = async (facility, data, token) => {
  const response = await axios({
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${portalApi}/v1/gef/facilities/${facility._id}`,
    data,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response;
};

const createEligibilityCriteria = async (data, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${portalApi}/v1/gef/eligibility-criteria`,
    data,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

const latestEligibilityCriteria = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${portalApi}/v1/gef/eligibility-criteria/latest`,
  }).catch((err) => { console.error(`err: ${err}`); });
  return response.data;
};

const createMandatoryCriteriaVersioned = async (mandatoryCriteria, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${portalApi}/v1/gef/mandatory-criteria-versioned`,
    data: mandatoryCriteria,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

module.exports = {
  createApplication,
  createEligibilityCriteria,
  createMandatoryCriteriaVersioned,
  latestEligibilityCriteria,
  updateApplication,
  updateFacilities,
  createFacilities,
  listDeals,
};
