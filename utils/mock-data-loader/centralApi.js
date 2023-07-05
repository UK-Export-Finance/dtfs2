const axios = require('axios');
require('dotenv').config();

const urlRoot = process.env.DTFS_CENTRAL_API;
const { API_KEY } = process.env;

const headers = {
  'Content-Type': 'application/json',
  'x-api-key': API_KEY,
  Accepts: 'application/json',
};

const getDeal = async (dealId) => {
  const response = await axios({
    method: 'get',
    url: `${urlRoot}/v1/portal/deals/${dealId}`,
    headers,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

const createFacility = async (facility, dealId, user) => {
  const response = await axios({
    method: 'post',
    url: `${urlRoot}/v1/portal/facilities`,
    headers,
    data: {
      facility: {
        ...facility,
        dealId,
      },
      user,
    },
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

const updateFacility = async (facilityId, facilityUpdate, user) => {
  const response = await axios({
    method: 'put',
    url: `${urlRoot}/v1/portal/facilities/${facilityId}`,
    headers,
    data: {
      ...facilityUpdate,
      user,
    },

  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

const listFacilities = async () => {
  const response = await axios({
    url: `${urlRoot}/v1/portal/facilities`,
    method: 'get',
    headers
  }).catch((err) => { console.error(`err: ${err}`); });

  if (!response) return [];
  return response.data;
};

const deleteFacility = async (facilityId) => {
  const response = await axios({
    method: 'delete',
    url: `${urlRoot}/v1/portal/facilities/${facilityId}`,
    headers,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

module.exports = {
  getDeal,
  createFacility,
  updateFacility,
  listFacilities,
  deleteFacility,
};
