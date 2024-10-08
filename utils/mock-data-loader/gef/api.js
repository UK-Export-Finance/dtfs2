const axios = require('axios');
const { HEADERS } = require('@ukef/dtfs2-common');
const ApiError = require('../errors/api.error');
const { mockDataLoaderPortalAuditDetails } = require('../constants/mockDataLoaderAuditDetails');
require('dotenv').config();

const { PORTAL_API_URL, DTFS_CENTRAL_API_URL, DTFS_CENTRAL_API_KEY } = process.env;

const headers = {
  portal: {
    [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    Accepts: 'application/json',
  },
  central: {
    [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    Accepts: 'application/json',
    'x-api-key': DTFS_CENTRAL_API_KEY,
  },
};

const createApplication = async (data, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      ...headers.portal,
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/gef/application`,
    data,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

const updateApplication = async (id, data, token) => {
  const response = await axios({
    method: 'put',
    headers: {
      ...headers.portal,
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/gef/application/${id}`,
    data,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

const listDeals = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      ...headers.portal,
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/gef/application`,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });
  return response.data.items;
};

const deleteDeal = async (dealId, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      ...headers.portal,
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/gef/application/${dealId}`,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

const createFacilities = async (data, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      ...headers.portal,
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/gef/facilities`,
    data,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

const listFacilities = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      ...headers.central,
      Authorization: token,
    },
    url: `${DTFS_CENTRAL_API_URL}/v1/portal/gef/facilities`,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });
  if (!response) return [];
  return response.data;
};

const deleteFacilities = async (facility, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      ...headers.portal,
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/gef/facilities/${facility._id}`,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response;
};

const updateFacilities = async (facility, data, token) => {
  const response = await axios({
    method: 'put',
    headers: {
      ...headers.portal,
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/gef/facilities/${facility._id}`,
    data,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response;
};

const createEligibilityCriteria = async (data, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      ...headers.portal,
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/gef/eligibility-criteria`,
    data,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

const deleteEligibilityCriteria = async (eligibilityCriteria, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      ...headers.portal,
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/gef/eligibility-criteria/${eligibilityCriteria.version}`,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

const listEligibilityCriteria = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      ...headers.portal,
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/gef/eligibility-criteria`,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data.items;
};

const latestEligibilityCriteria = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      ...headers.portal,
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/gef/eligibility-criteria/latest`,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });
  return response.data;
};

// Mandatory Criteria

const createMandatoryCriteriaVersioned = async (mandatoryCriteria, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      ...headers.portal,
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/gef/mandatory-criteria-versioned`,
    data: mandatoryCriteria,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

const deleteMandatoryCriteriaVersioned = async (mandatoryCriteria, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      ...headers.portal,
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/gef/mandatory-criteria-versioned/${mandatoryCriteria._id}`,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

const listMandatoryCriteriaVersioned = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      ...headers.portal,
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/gef/mandatory-criteria-versioned`,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data.items;
};

const deleteDurableFunctions = async (token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      ...headers.central,
      Authorization: token,
    },
    url: `${DTFS_CENTRAL_API_URL}/v1/portal/durable-functions`,
    data: {
      auditDetails: mockDataLoaderPortalAuditDetails,
    },
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });
  return response;
};

const deleteCronJobs = async (token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      ...headers.central,
      Authorization: token,
    },
    url: `${DTFS_CENTRAL_API_URL}/v1/portal/cron-jobs`,

    data: {
      auditDetails: mockDataLoaderPortalAuditDetails,
    },
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });
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
  latestEligibilityCriteria,
  createMandatoryCriteriaVersioned,
  deleteMandatoryCriteriaVersioned,
  listMandatoryCriteriaVersioned,
  deleteDurableFunctions,
  deleteCronJobs,
};
