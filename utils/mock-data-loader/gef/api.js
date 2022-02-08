/* eslint-disable no-underscore-dangle */
const axios = require('axios');
require('dotenv').config();

const centralApi = process.env.DTFS_CENTRAL_API;
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

const deleteDeal = async (dealId, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${portalApi}/v1/gef/application/${dealId}`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
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

const listFacilities = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${centralApi}/v1/portal/gef/facilities`
  }).catch((err) => { console.error(`err: ${err}`); });
  if (!response) return [];
  return response.data;
};

const deleteFacilities = async (facility, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${portalApi}/v1/gef/facilities/${facility._id}`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response;
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

const deleteEligibilityCriteria = async (mandatoryCriteria, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${portalApi}/v1/gef/eligibility-criteria/${mandatoryCriteria._id}`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

const listEligibilityCriteria = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${portalApi}/v1/gef/eligibility-criteria`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data.items;
};

// Mandatory Criteria

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

const deleteMandatoryCriteriaVersioned = async (mandatoryCriteria, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${portalApi}/v1/gef/mandatory-criteria-versioned/${mandatoryCriteria._id}`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

const listMandatoryCriteriaVersioned = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${portalApi}/v1/gef/mandatory-criteria-versioned`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data.items;
};

const getDurableFunctions = async (token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${centralApi}/v1/portal/durable-functions`
  }).catch((err) => { console.error(`err: ${err}`); });
  return response;
};

module.exports = {
  createApplication,
  updateApplication,
  listDeals,
  deleteDeal,
  createFacilities,
  listFacilities,
  deleteFacilities,
  updateFacilities,
  createEligibilityCriteria,
  deleteEligibilityCriteria,
  listEligibilityCriteria,
  createMandatoryCriteriaVersioned,
  deleteMandatoryCriteriaVersioned,
  listMandatoryCriteriaVersioned,
  getDurableFunctions,
};
