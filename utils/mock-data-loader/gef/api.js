/* eslint-disable no-underscore-dangle */
const axios = require('axios');
require('dotenv').config();

const urlRoot = process.env.DEAL_API_URL;

// Application

const createApplication = async (data, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/gef/application`,
    data,
  }).catch((err) => { console.log(`err: ${err}`); });

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
    url: `${urlRoot}/v1/gef/application/${id}`,
    data,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data;
};

const deleteApplication = async (data, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/gef/application/${data._id}`,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data;
};

const listApplication = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/gef/application`, // ?page=null&pageSize=null
  }).catch((err) => { console.log(`err: ${err}`); });
  return response.data.items;
};

// Exporter

const deleteExporter = async (exporterId, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/gef/exporter/${exporterId}`,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response;
};

const updateExporter = async (exporterId, data, token) => {
  const response = await axios({
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/gef/exporter/${exporterId}`,
    data,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response;
};

// Facilities

const createFacilities = async (data, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/gef/facilities`,
    data,
  }).catch((err) => { console.log(`err: ${err}`); });

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
    url: `${urlRoot}/v1/gef/facilities`, // ?page=null&pageSize=null
  }).catch((err) => { console.log(`err: ${err}`); });
  return response.data.items;
};

const deleteFacilities = async (facility, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/gef/facilities/${facility._id}`,
  }).catch((err) => { console.log(`err: ${err}`); });

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
    url: `${urlRoot}/v1/gef/facilities/${facility._id}`,
    data,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response;
};

// Eligibility Criteria

const createEligibilityCriteria = async (data, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/gef/eligibility-criteria`,
    data,
  }).catch((err) => { console.log(`err: ${err}`); });

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
    url: `${urlRoot}/v1/gef/eligibility-criteria/${mandatoryCriteria._id}`,
  }).catch((err) => { console.log(`err: ${err}`); });

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
    url: `${urlRoot}/v1/gef/eligibility-criteria`,
  }).catch((err) => { console.log(`err: ${err}`); });

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
    url: `${urlRoot}/v1/gef/mandatory-criteria-versioned`,
    data: mandatoryCriteria,
  }).catch((err) => { console.log(`err: ${err}`); });

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
    url: `${urlRoot}/v1/gef/mandatory-criteria-versioned/${mandatoryCriteria._id}`,
  }).catch((err) => { console.log(`err: ${err}`); });

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
    url: `${urlRoot}/v1/gef/mandatory-criteria-versioned`,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data.items;
};


module.exports = {
  createApplication,
  updateApplication,
  deleteApplication,
  listApplication,
  deleteExporter,
  updateExporter,
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
};
