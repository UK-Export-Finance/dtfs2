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
    data
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
    url: `${urlRoot}/v1/gef/application`, //?page=null&pageSize=null
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data.data;
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
    url: `${urlRoot}/v1/gef/mandatory-criteria-versioned/${mandatoryCriteria.id}`,
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

  return response.data.mandatoryCriteria;
};


module.exports = {
  createApplication,
  deleteApplication,
  listApplication,
  deleteExporter,
  updateExporter,
  createMandatoryCriteriaVersioned,
  deleteMandatoryCriteriaVersioned,
  listMandatoryCriteriaVersioned,
};
