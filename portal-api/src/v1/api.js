const axios = require('axios');

require('dotenv').config();

const centralApiUrl = process.env.DTFS_CENTRAL_API;
const tfmUrl = process.env.TFM_API;

const findOneDeal = async (dealId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/portal/deals/${dealId}`,
      headers: {
        'Content-Type': 'application/json',
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

const findLatestMandatoryCriteria = async (dealType) => {
  try {
    const { data } = await axios.get(`${centralApiUrl}/v1/portal/mandatory-criteria?dealType=${dealType}&latest=true`);
    return { status: 200, data };
  } catch (err) {
    console.error(`Unable to get the latest ${dealType} mandatory criteria %O`, { response: err?.response?.data });
    return { status: 500, data: err?.response?.data };
  }
};

const findAllMandatoryCriteria = async (dealType) => {
  try {
    const { data } = await axios.get(`${centralApiUrl}/v1/portal/mandatory-criteria?dealType=${dealType}`);
    return { status: 200, data };
  } catch (err) {
    console.error('Unable to get all mandatory criteria %O', { response: err?.response?.data });
    return { status: 500, data: err?.response?.data };
  }
};

const findOneMandatoryCriteria = async (id, dealType) => {
  try {
    const { data } = await axios.get(`${centralApiUrl}/v1/portal/mandatory-criteria/${id}?dealType=${dealType}`);

    return { status: 200, data };
  } catch (err) {
    console.error(`Unable to get one ${dealType} mandatory criteria ${err?.response?.data} %O`, { response: err?.response?.data });
    return { status: err?.response?.status, data: err?.response?.data };
  }
};

const postMandatoryCriteria = async (payload, dealType) => {
  try {
    const { data } = await axios.post(`${centralApiUrl}/v1/portal/mandatory-criteria?dealType=${dealType}`, payload);
    return { status: 200, data };
  } catch (err) {
    console.error(`Unable to create the ${dealType} mandatory criteria %O`, { response: err?.response?.data });
    return { status: 500, data: err?.response?.data };
  }
};

const putMandatoryCriteria = async (payload, id, dealType) => {
  try {
    const { data } = await axios.put(`${centralApiUrl}/v1/portal/mandatory-criteria/${id}?dealType=${dealType}`, payload);
    return { status: 200, data };
  } catch (err) {
    console.error(`Unable to update the ${dealType} mandatory criteria %O`, { response: err?.response?.data });
    return { status: 500, data: err?.response?.data };
  }
};

const deleteMandatoryCriteria = async (id, dealType) => {
  try {
    const { data } = await axios.delete(`${centralApiUrl}/v1/portal/mandatory-criteria/${id}?dealType=${dealType}`);
    return { status: 200, data };
  } catch (err) {
    console.error(`Unable to delete the ${dealType} mandatory criteria %O`, { response: err?.response?.data });
    return { status: err?.response?.status, data: err?.response?.data };
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
  findLatestMandatoryCriteria,
  findAllMandatoryCriteria,
  findOneMandatoryCriteria,
  postMandatoryCriteria,
  putMandatoryCriteria,
  deleteMandatoryCriteria
};
