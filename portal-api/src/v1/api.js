const axios = require('axios');

require('dotenv').config();

const urlRoot = process.env.DTFS_CENTRAL_API;
const tfmUrl = process.env.TFM_API;

const findOneDeal = async (dealId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${urlRoot}/v1/portal/deals/${dealId}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data.deal;
  } catch (err) {
    return false;
  }
};

const queryDeals = async (query, start = 0, pagesize = 0) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${urlRoot}/v1/portal/deals/query`,
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
    return false;
  }
};

const queryAllDeals = async (filters, sort, start = 0, pagesize = 0) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${urlRoot}/v1/portal/deals`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        filters,
        sort,
        start,
        pagesize,
      },
    });

    return response.data;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const createDeal = async (deal, user) => {
  try {
    return await axios({
      method: 'post',
      url: `${urlRoot}/v1/portal/deals`,
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
      url: `${urlRoot}/v1/portal/deals/${dealId}`,
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
      url: `${urlRoot}/v1/portal/deals/${dealId}`,
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
      url: `${urlRoot}/v1/portal/deals/${dealId}/comment`,
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
      url: `${urlRoot}/v1/portal/facilities`,
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

const createMultipleFacilities = async (facilities, associatedDealId, user) => {
  try {
    return await axios({
      method: 'post',
      url: `${urlRoot}/v1/portal/multiple-facilities`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        facilities,
        associatedDealId,
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
      url: `${urlRoot}/v1/portal/facilities/${facilityId}`,
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
      url: `${urlRoot}/v1/portal/facilities/${facilityId}`,
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
      url: `${urlRoot}/v1/portal/facilities/${facilityId}`,
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

const tfmDealSubmit = async (dealId, portalChecker, origin = '') => {
  try {
    const response = await axios({
      method: 'put',
      url: `${tfmUrl}/v1/deals/submit`,
      headers: {
        'Content-Type': 'application/json',
        origin,
      },
      data: {
        dealId,
        portalChecker,
      },
    });

    return response.data;
  } catch (err) {
    return err;
  }
};


module.exports = {
  findOneDeal,
  queryDeals,
  queryAllDeals,
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
};
