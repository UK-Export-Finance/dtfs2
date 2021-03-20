const axios = require('axios');

require('dotenv').config();

const centralApiUrl = process.env.DTFS_CENTRAL_API;
const refDataUrl = process.env.REFERENCE_DATA_PROXY_URL;
const azureAcbsFunctionUrl = process.env.AZURE_ACBS_FUNCTION_URL;

const findOnePortalDeal = async (dealId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/portal/deals/${dealId}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data.deal;
  } catch ({ response }) {
    return false;
  }
};

const updatePortalDealStatus = async (dealId, status) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/portal/deals/${dealId}/status`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        status,
      },
    });

    return response.data;
  } catch ({ response }) {
    return false;
  }
};

const findOneDeal = async (dealId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/tfm/deals/${dealId}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data.deal;
  } catch ({ response }) {
    return false;
  }
};

const updateDeal = async (dealId, dealUpdate, user) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/tfm/deals/${dealId}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        dealUpdate,
        user,
      },
    });

    return response.data;
  } catch (err) {
    return err;
  }
};

const submitDeal = async (dealId) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/tfm/deals/${dealId}/submit`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {},
    });

    return response.data;
  } catch (err) {
    return err;
  }
};

const findOneFacility = async (facilityId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/tfm/facilities/${facilityId}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (err) {
    return err;
  }
};

const updateFacility = async (facilityId, facilityUpdate, user) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/tfm/facilities/${facilityId}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        facilityUpdate,
        user,
      },
    });

    return response.data;
  } catch (err) {
    return err;
  }
};

const queryDeals = async ({ query, start = 0, pagesize = 0 }) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/tfm/deals`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        query,
        start,
        pagesize,
      },
    });

    return response.data;
  } catch (err) {
    return err;// do something proper here, but for now just reject failed logins..
  }
};

const getPartyDbInfo = async ({ companyRegNo }) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${refDataUrl}/party-db/${encodeURIComponent(companyRegNo)}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch ({ response }) {
    return false;
  }
};

const findUser = async (username) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/tfm/users/${username}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch ({ response }) {
    return false;
  }
};

const findUserById = async (userId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/tfm/users/id/${userId}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch ({ response }) {
    return false;
  }
};

const updateUserTasks = async (userId, updatedTasks) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/tfm/users/${userId}/tasks`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        updatedTasks,
      },
    });
    return response.data;
  } catch ({ response }) {
    return false;
  }
};

const findTeamMembers = async (teamId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/tfm/users/team/${teamId}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (err) {
    return err;
  }
};

const getCurrencyExchangeRate = async (source, target) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${refDataUrl}/currency-exchange-rate/${source}/${target}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (err) {
    return err;
  }
};

const getFacilityExposurePeriod = async (startDate, endDate, facilityType) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${refDataUrl}/exposure-period/${startDate}/${endDate}/${facilityType}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (err) {
    return err;
  }
};

const createACBS = async (deal, bank) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${refDataUrl}/acbs`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        deal,
        bank,
      },
    });
    return response.data;
  } catch (err) {
    return err;
  }
};

const getFunctionsAPI = async (url = '') => {
  // Need to refer to docker internal to work on localhost
  const modifiedUrl = url.replace(/http:\/\/localhost:[\d]*/, azureAcbsFunctionUrl);

  try {
    const response = await axios({
      method: 'get',
      url: modifiedUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (err) {
    return err.response.data;
  }
};

module.exports = {
  findOneDeal,
  findOnePortalDeal,
  updatePortalDealStatus,
  updateDeal,
  submitDeal,
  findOneFacility,
  updateFacility,
  queryDeals,
  getPartyDbInfo,
  findUser,
  findUserById,
  updateUserTasks,
  findTeamMembers,
  getCurrencyExchangeRate,
  getFacilityExposurePeriod,
  createACBS,
  getFunctionsAPI,
};
