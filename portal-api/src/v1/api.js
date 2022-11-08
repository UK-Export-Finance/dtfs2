const axios = require('axios');
const { CENTRAL_API, TFM_API, REFERENCE_DATA_PROXY_URL } = require('../config/environment.config');

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
    return { status: err?.response?.status, data: err?.response?.data };
  }
};

const findAllMandatoryCriteria = async (dealType) => {
  try {
    const { data } = await axios.get(`${CENTRAL_API}/v1/portal/mandatory-criteria?dealType=${dealType}`);
    return { status: 200, data };
  } catch (err) {
    console.error('Unable to get all mandatory criteria %O', { response: err?.response?.data });
    return { status: err?.response?.status, data: err?.response?.data };
  }
};

const findOneMandatoryCriteria = async (version, dealType) => {
  try {
    const { data } = await axios.get(`${CENTRAL_API}/v1/portal/mandatory-criteria/${version}?dealType=${dealType}`);
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
    return { status: err?.response?.status, data: err?.response?.data };
  }
};

const putMandatoryCriteria = async (payload, version, dealType) => {
  try {
    const { data } = await axios.put(`${CENTRAL_API}/v1/portal/mandatory-criteria/${version}?dealType=${dealType}`, payload);
    return { status: 200, data };
  } catch (err) {
    console.error(`Unable to update the ${dealType} mandatory criteria %O`, { response: err?.response?.data });
    return { status: err?.response?.status, data: err?.response?.data };
  }
};

const deleteMandatoryCriteria = async (version, dealType) => {
  try {
    const { data } = await axios.delete(`${CENTRAL_API}/v1/portal/mandatory-criteria/${version}?dealType=${dealType}`);
    return { status: 200, data };
  } catch (err) {
    console.error(`Unable to delete the ${dealType} mandatory criteria %O`, { response: err?.response?.data });
    return { status: err?.response?.status, data: err?.response?.data };
  }
};

// Eligibility Criteria

const findLatestEligibilityCriteria = async (dealType) => {
  try {
    const { data } = await axios.get(`${CENTRAL_API}/v1/portal/eligibility-criteria?dealType=${dealType}&latest=true`);
    return { status: 200, data };
  } catch (err) {
    console.error(`Unable to get the latest ${dealType} eligibility criteria %O`, { response: err?.response?.data });
    return { status: err?.response?.status, data: err?.response?.data };
  }
};

const findAllEligibilityCriteria = async (dealType) => {
  try {
    const { data } = await axios.get(`${CENTRAL_API}/v1/portal/eligibility-criteria?dealType=${dealType}`);
    return { status: 200, data };
  } catch (err) {
    console.error('Unable to get all eligibility criteria %O', { response: err?.response?.data });
    return { status: err?.response?.status, data: err?.response?.data };
  }
};

const findOneEligibilityCriteria = async (version, dealType) => {
  try {
    const { data } = await axios.get(`${CENTRAL_API}/v1/portal/eligibility-criteria/${version}?dealType=${dealType}`);

    return { status: 200, data };
  } catch (err) {
    console.error(`Unable to get one ${dealType} eligibility criteria ${err?.response?.data} %O`, { response: err?.response?.data });
    return { status: err?.response?.status, data: err?.response?.data };
  }
};

const postEligibilityCriteria = async (payload, dealType) => {
  try {
    const { data } = await axios.post(`${CENTRAL_API}/v1/portal/eligibility-criteria?dealType=${dealType}`, payload);
    return { status: 200, data };
  } catch (err) {
    console.error(`Unable to create the ${dealType} eligibility criteria %O`, { response: err?.response?.data });
    return { status: err?.response?.status, data: err?.response?.data };
  }
};

const putEligibilityCriteria = async (payload, version, dealType) => {
  try {
    const { data } = await axios.put(`${CENTRAL_API}/v1/portal/eligibility-criteria/${version}?dealType=${dealType}`, payload);
    return { status: 200, data };
  } catch (err) {
    console.error(`Unable to update the ${dealType} eligibility criteria %O`, { response: err?.response?.data });
    return { status: err?.response?.status, data: err?.response?.data };
  }
};

const deleteEligibilityCriteria = async (version, dealType) => {
  try {
    const { data } = await axios.delete(`${CENTRAL_API}/v1/portal/eligibility-criteria/${version}?dealType=${dealType}`);
    return { status: 200, data };
  } catch (err) {
    console.error(`Unable to delete the ${dealType} eligibility criteria %O`, { response: err?.response?.data });
    return { status: err?.response?.status, data: err?.response?.data };
  }
};

const sendEmail = async (templateId, sendToEmailAddress, emailVariables) => {
  try {
    const { data } = await axios({
      method: 'post',
      url: `${REFERENCE_DATA_PROXY_URL}/email`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        templateId,
        sendToEmailAddress,
        emailVariables,
      },
    });
    return data;
  } catch (err) {
    console.error(`Error sending email to ${sendToEmailAddress}: ${err}`);
    return false;
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
  deleteMandatoryCriteria,
  findLatestEligibilityCriteria,
  findAllEligibilityCriteria,
  findOneEligibilityCriteria,
  postEligibilityCriteria,
  putEligibilityCriteria,
  deleteEligibilityCriteria,
  sendEmail
};
