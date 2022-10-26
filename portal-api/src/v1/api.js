const axios = require('axios');
const ENV = require('../config/environment.config');

const CENTRAL_API = (new URL(ENV.CENTRAL_API)).toString();
const TFM_API = (new URL(ENV.TFM_API)).toString();

const findOneDeal = async (dealId) => {
  try {
    const { data: { deal } } = await axios.get(`${CENTRAL_API}/v1/portal/deals/${dealId}`);
    return deal;
  } catch (err) {
    return false;
  }
};

const createDeal = async (deal, user) => {
  try {
    return await axios.post(`${CENTRAL_API}/v1/portal/deals`, { deal, user });
  } catch ({ response }) {
    return response;
  }
};

const updateDeal = async (dealId, dealUpdate, user) => {
  try {
    const { data } = await axios.put(`${CENTRAL_API}/v1/portal/deals/${dealId}`, { dealUpdate, user });
    return data;
  } catch (err) {
    return err;
  }
};

const deleteDeal = async (dealId) => {
  try {
    return await axios.delete(`${CENTRAL_API}/v1/portal/deals/${dealId}`,);
  } catch (err) {
    return err;
  }
};

const addDealComment = async (dealId, commentType, comment) => {
  try {
    const { data } = await axios.post(`${CENTRAL_API}/v1/portal/deals/${dealId}/comment`, { commentType, comment });
    return data;
  } catch (err) {
    return err;
  }
};

const createFacility = async (facility, user) => {
  try {
    return await axios.post(`${CENTRAL_API}/v1/portal/facilities`, { facility, user });
  } catch ({ response }) {
    return response;
  }
};

const createMultipleFacilities = async (facilities, dealId, user) => {
  try {
    return await axios.post(`${CENTRAL_API}/v1/portal/multiple-facilities`, { facilities, dealId, user });
  } catch ({ response }) {
    return response;
  }
};

const findOneFacility = async (facilityId) => {
  try {
    const { data } = await axios.get(`${CENTRAL_API}/v1/portal/facilities/${facilityId}`);
    return data;
  } catch (err) {
    return false;
  }
};

const updateFacility = async (facilityId, facility, user) => {
  try {
    return await axios.put(`${CENTRAL_API}/v1/portal/facilities/${facilityId}`, { ...facility, user });
  } catch ({ response }) {
    return response;
  }
};

const deleteFacility = async (facilityId, user) => {
  try {
    return await axios.delete(`${CENTRAL_API}/v1/portal/facilities/${facilityId}`, { user });
  } catch ({ response }) {
    return response;
  }
};

const tfmDealSubmit = async (dealId, dealType, checker) => {
  try {
    const { data } = await axios.put(`${TFM_API}/v1/deals/submit`, { dealId, dealType, checker, });
    return data;
  } catch (err) {
    return err;
  }
};

const findLatestMandatoryCriteria = async (dealType) => {
  try {
    const { data } = await axios.get(`${CENTRAL_API}/v1/portal/mandatory-criteria?dealType=${dealType}&latest=true`);
    return { status: 200, data };
  } catch (err) {
    console.error(`Unable to get the latest ${dealType} mandatory criteria %O`, { response: err?.response?.data });
    return { status: 500, data: err?.response?.data };
  }
};

const findAllMandatoryCriteria = async (dealType) => {
  try {
    const { data } = await axios.get(`${CENTRAL_API}/v1/portal/mandatory-criteria?dealType=${dealType}`);
    return { status: 200, data };
  } catch (err) {
    console.error('Unable to get all mandatory criteria %O', { response: err?.response?.data });
    return { status: 500, data: err?.response?.data };
  }
};

const findOneMandatoryCriteria = async (id, dealType) => {
  try {
    const { data } = await axios.get(`${CENTRAL_API}/v1/portal/mandatory-criteria/${id}?dealType=${dealType}`);

    return { status: 200, data };
  } catch (err) {
    console.error(`Unable to get one ${dealType} mandatory criteria ${err?.response?.data} %O`, { response: err?.response?.data });
    return { status: err?.response?.status, data: err?.response?.data };
  }
};

const postMandatoryCriteria = async (payload, dealType) => {
  try {
    const { data } = await axios.post(`${CENTRAL_API}/v1/portal/mandatory-criteria?dealType=${dealType}`, payload);
    return { status: 200, data };
  } catch (err) {
    console.error(`Unable to create the ${dealType} mandatory criteria %O`, { response: err?.response?.data });
    return { status: 500, data: err?.response?.data };
  }
};

const putMandatoryCriteria = async (payload, id, dealType) => {
  try {
    const { data } = await axios.put(`${CENTRAL_API}/v1/portal/mandatory-criteria/${id}?dealType=${dealType}`, payload);
    return { status: 200, data };
  } catch (err) {
    console.error(`Unable to update the ${dealType} mandatory criteria %O`, { response: err?.response?.data });
    return { status: 500, data: err?.response?.data };
  }
};

const deleteMandatoryCriteria = async (id, dealType) => {
  try {
    const { data } = await axios.delete(`${CENTRAL_API}/v1/portal/mandatory-criteria/${id}?dealType=${dealType}`);
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
