const axios = require('axios');

require('dotenv').config();

const CONSTANTS = require('../constants');

const centralApiUrl = process.env.DTFS_CENTRAL_API;
const refDataUrl = process.env.REFERENCE_DATA_PROXY_URL;
const azureAcbsFunctionUrl = process.env.AZURE_ACBS_FUNCTION_URL;
const azureNumberGeneratorUrl = process.env.AZURE_NUMBER_GENERATOR_FUNCTION_URL;

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

const updatePortalDeal = async (dealId, update) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/portal/deals/${dealId}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        dealUpdate: update,
      },
    });

    return response.data;
  } catch ({ response }) {
    console.error(`TFM API - error updating BSS deal ${dealId}`);

    return false;
  }
};

const updatePortalBssDealStatus = async (dealId, status) => {
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
    console.error(`TFM API - error updating BSS deal status ${dealId}`);

    return false;
  }
};

const addPortalDealComment = async (dealId, commentType, comment) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${centralApiUrl}/v1/portal/deals/${dealId}/comment`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        dealId,
        commentType,
        comment,
      },
    });

    return response.data;
  } catch ({ response }) {
    return false;
  }
};

const updatePortalFacilityStatus = async (facilityId, status) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/portal/facilities/${facilityId}/status`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        status,
      },
    });

    return response.data;
  } catch ({ response }) {
    console.error(`TFM API - error updating BSS facility status ${facilityId}`, response);

    return false;
  }
};

const updatePortalFacility = async (facilityId, update) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/portal/facilities/${facilityId}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: update,
    });

    return response.data;
  } catch ({ response }) {
    console.error(`TFM API - error updating BSS facility ${facilityId}`);

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
    console.error(`TFM API - error finding BSS deal ${dealId}`);

    return false;
  }
};

const updateDeal = async (dealId, dealUpdate) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/tfm/deals/${dealId}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        dealUpdate,
      },
    });

    return response.data;
  } catch (err) {
    return err;
  }
};

const updateDealSnapshot = async (dealId, snapshotUpdate) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/tfm/deals/${dealId}/snapshot`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: snapshotUpdate,
    });

    return response.data;
  } catch (err) {
    return err;
  }
};

const submitDeal = async (dealType, dealId) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/tfm/deals/submit`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        dealType,
        dealId,
      },
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
    console.error(`TFM API - error finding BSS facility ${facilityId}`);

    return err;
  }
};

const findFacilitesByDealId = async (dealId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/tfm/deals/${dealId}/facilities`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (err) {
    return err;
  }
};

const updateFacility = async (facilityId, facilityUpdate) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/tfm/facilities/${facilityId}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        facilityUpdate,
      },
    });

    return response.data;
  } catch (err) {
    return err;
  }
};

const queryDeals = async ({
  queryParams,
  start = 0,
  pagesize = 0,
}) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/tfm/deals`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        queryParams,
        start,
        pagesize,
      },
    });

    return response.data;
  } catch (err) {
    return err;
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

const findOneTeam = async (teamId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/tfm/teams/${teamId}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data.team;
  } catch (err) {
    return err;
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
    return { err };
  }
};

const getFacilityExposurePeriod = async (startDate, endDate, type) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${refDataUrl}/exposure-period/${startDate}/${endDate}/${type}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (err) {
    return err;
  }
};

const getPremiumSchedule = async (premiumScheduleParameters) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${refDataUrl}/premium-schedule`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: premiumScheduleParameters,
    });

    if (response.status === 200 || response.status === 201) {
      return response.data;
    }
    return null;
  } catch ({ response }) {
    return null;
  }
};

const createACBS = async (deal, bank) => {
  if (!!deal && !!bank) {
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
      console.error('ACBS create error\n\r', err);
      return false;
    }
  }
  return {};
};

const updateACBSfacility = async (facility, dealType, supplierName) => {
  if (!!facility && !!dealType && !!supplierName) {
    try {
      const response = await axios({
        method: 'post',
        url: `${refDataUrl}/acbs/facility/${facility.ukefFacilityId}/issue`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          facility,
          dealType,
          supplierName,
        },
      });
      return response.data;
    } catch (err) {
      console.error('ACBS Facility update error', { err });
      return err;
    }
  }
  return {};
};

const getFunctionsAPI = async (type = 'ACBS', url = '') => {
  // Need to refer to docker internal to work on localhost
  let functionUrl;
  switch (type) {
    case CONSTANTS.DURABLE_FUNCTIONS.TYPE.ACBS:
      functionUrl = azureAcbsFunctionUrl;
      break;

    case CONSTANTS.DURABLE_FUNCTIONS.TYPE.NUMBER_GENERATOR:
      functionUrl = azureNumberGeneratorUrl;
      break;

    default:
  }

  let modifiedUrl = url.replace(/http:\/\/localhost:[\d]*/, functionUrl);
  if (type === 'ACBS') {
    modifiedUrl = url ? url.replace(/http:\/\/localhost:[\d]*/, functionUrl) : functionUrl;
  }

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
    console.error(`Unable to getFunctionsAPI for ${modifiedUrl}`, { err });
    return err?.response?.data ? err?.response?.data : err;
  }
};

const createEstoreFolders = async (eStoreFolderInfo) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${refDataUrl}/estore`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        eStoreFolderInfo,
      },
    });
    return response.data;
  } catch (err) {
    return {};
  }
};

const sendEmail = async (
  templateId,
  sendToEmailAddress,
  emailVariables,
) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${refDataUrl}/email`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        templateId,
        sendToEmailAddress,
        emailVariables,
      },
    });
    return response.data;
  } catch ({ response }) {
    return false;
  }
};

const findOneGefDeal = async (dealId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/portal/gef/deals/${dealId}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (err) {
    console.error(`TFM API - error finding GEF deal ${dealId}`);

    return false;
  }
};

const updatePortalGefDealStatus = async (dealId, status) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/portal/gef/deals/${dealId}/status`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        status,
      },
    });

    return response.data;
  } catch (err) {
    console.error(`TFM API - error updating GEF deal status ${dealId}`);

    return false;
  }
};

const updatePortalGefDeal = async (dealId, update) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/portal/gef/deals/${dealId}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        dealUpdate: update,
      },
    });

    return response.data;
  } catch (err) {
    console.error(`TFM API - error updating GEF deal ${dealId}`, { err });

    return false;
  }
};

const updateGefMINActivity = async (dealId) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/portal/gef/deals/activity/${dealId}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (err) {
    console.error(`TFM API - error updating GEF deal ${dealId}`, { err });

    return false;
  }
};

const addUnderwriterCommentToGefDeal = async (dealId, commentType, comment) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${centralApiUrl}/v1/portal/gef/deals/${dealId}/comment`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: { dealId, commentType, comment },
    });

    return response.data;
  } catch ({ response }) {
    console.error('Unable to add a comment as an underwriter ', response);
    return false;
  }
};

const getAllFacilities = async (searchString) => {
  try {
    const response = await axios({
      method: 'GET',
      data: searchString,
      url: `${centralApiUrl}/v1/tfm/facilities`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch ({ response }) {
    console.error('Unable to get all facilities', response);
    return response;
  }
};

module.exports = {
  findOneDeal,
  findOnePortalDeal,
  addPortalDealComment,
  updatePortalDeal,
  updatePortalBssDealStatus,
  updatePortalFacilityStatus,
  updatePortalFacility,
  updateDeal,
  updateDealSnapshot,
  submitDeal,
  getAllFacilities,
  findOneFacility,
  findFacilitesByDealId,
  updateFacility,
  queryDeals,
  getPartyDbInfo,
  findUser,
  findUserById,
  updateUserTasks,
  findOneTeam,
  findTeamMembers,
  getCurrencyExchangeRate,
  getFacilityExposurePeriod,
  getPremiumSchedule,
  createACBS,
  updateACBSfacility,
  getFunctionsAPI,
  createEstoreFolders,
  sendEmail,
  findOneGefDeal,
  updatePortalGefDealStatus,
  updatePortalGefDeal,
  addUnderwriterCommentToGefDeal,
  updateGefMINActivity,
};
