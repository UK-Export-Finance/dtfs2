const axios = require('axios');
const { HEADERS } = require('@ukef/dtfs2-common');
const { mockDataLoaderPortalAuditDetails } = require('./constants/mockDataLoaderAuditDetails');
const ApiError = require('./errors/api.error');
require('dotenv').config();

const { DTFS_CENTRAL_API_URL, DTFS_CENTRAL_API_KEY } = process.env;

const headers = {
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
  'x-api-key': DTFS_CENTRAL_API_KEY,
  Accepts: 'application/json',
};

const getDeal = async (dealId) => {
  const response = await axios({
    method: 'get',
    url: `${DTFS_CENTRAL_API_URL}/v1/portal/deals/${dealId}`,
    headers,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

const createFacility = async (facility, dealId, user) => {
  const response = await axios({
    method: 'post',
    url: `${DTFS_CENTRAL_API_URL}/v1/portal/facilities`,
    headers,
    data: {
      facility: {
        ...facility,
        dealId,
      },
      user,
      auditDetails: mockDataLoaderPortalAuditDetails,
    },
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

const updateFacility = async (facilityId, facilityUpdate, user) => {
  const response = await axios({
    method: 'put',
    url: `${DTFS_CENTRAL_API_URL}/v1/portal/facilities/${facilityId}`,
    headers,
    data: {
      facilityUpdate,
      user,
      auditDetails: mockDataLoaderPortalAuditDetails,
    },
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

const listFacilities = async () => {
  const response = await axios({
    url: `${DTFS_CENTRAL_API_URL}/v1/portal/facilities`,
    method: 'get',
    headers,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  if (!response) return [];
  return response.data;
};

const deleteFacility = async (facilityId) => {
  const response = await axios({
    method: 'delete',
    url: `${DTFS_CENTRAL_API_URL}/v1/portal/facilities/${facilityId}`,
    headers,
    data: {
      auditDetails: mockDataLoaderPortalAuditDetails,
    },
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

module.exports = {
  getDeal,
  createFacility,
  updateFacility,
  listFacilities,
  deleteFacility,
};
