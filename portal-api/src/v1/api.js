const axios = require('axios');

require('dotenv').config();

const centralApiUrl = process.env.DTFS_CENTRAL_API;
const tfmUrl = process.env.TFM_API;
const { API_KEY } = process.env;

const findOneDeal = async (dealId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/portal/deals/${dealId}`,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
    });

    return response.data.deal;
  } catch (err) {
    return false;
  }
};

const createDeal = async (deal, user) => {
  try {
    return await axios({
      method: 'post',
      url: `${centralApiUrl}/v1/portal/deals`,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      data: {
        deal,
        user,
      },
    });
  } catch ({ response }) {
    return response;
  }
};

const updateDeal = async (dealId, dealUpdate, user) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/portal/deals/${dealId}`,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
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

const deleteDeal = async (dealId) => {
  try {
    return await axios({
      method: 'delete',
      url: `${centralApiUrl}/v1/portal/deals/${dealId}`,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
    });
  } catch (err) {
    return err;
  }
};

const addDealComment = async (dealId, commentType, comment) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${centralApiUrl}/v1/portal/deals/${dealId}/comment`,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      data: {
        commentType,
        comment,
      },
    });

    return response.data;
  } catch (err) {
    return err;
  }
};

const createFacility = async (facility, user) => {
  try {
    return await axios({
      method: 'post',
      url: `${centralApiUrl}/v1/portal/facilities`,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      data: {
        facility,
        user,
      },
    });
  } catch ({ response }) {
    return response;
  }
};

const createMultipleFacilities = async (facilities, dealId, user) => {
  try {
    return await axios({
      method: 'post',
      url: `${centralApiUrl}/v1/portal/multiple-facilities`,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      data: {
        facilities,
        dealId,
        user,
      },
    });
  } catch ({ response }) {
    return response;
  }
};

const findOneFacility = async (facilityId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/portal/facilities/${facilityId}`,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
    });

    return response.data;
  } catch (err) {
    return false;
  }
};

const updateFacility = async (facilityId, facility, user) => {
  try {
    return await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/portal/facilities/${facilityId}`,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      data: {
        ...facility,
        user,
      },
    });
  } catch ({ response }) {
    return response;
  }
};

const deleteFacility = async (facilityId, user) => {
  try {
    return await axios({
      method: 'delete',
      url: `${centralApiUrl}/v1/portal/facilities/${facilityId}`,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      data: {
        user,
      },
    });
  } catch ({ response }) {
    return response;
  }
};

const tfmDealSubmit = async (dealId, dealType, checker) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${tfmUrl}/v1/deals/submit`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        dealId,
        dealType,
        checker,
      },
    });

    return response.data;
  } catch (err) {
    return err;
  }
};

const findLatestGefMandatoryCriteria = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/portal/gef/mandatory-criteria/latest`,
      headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY, }
    });

    return { status: 200, data: response.data };
  } catch (err) {
    console.error('Unable to get the latest mandatory criteria for GEF deals %O', { response: err?.response?.data });
    return { status: 500, data: err?.response?.data };
  }
};

module.exports = {
  findOneDeal,
  createDeal,
  updateDeal,
  deleteDeal,
  addDealComment,
  createFacility,
  createMultipleFacilities,
  findOneFacility,
  updateFacility,
  deleteFacility,
  tfmDealSubmit,
  findLatestGefMandatoryCriteria,
};
