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

const tfmDealSubmit = async (dealId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${tfmUrl}/v1/deals/${dealId}/submit`,
      headers: {
        'Content-Type': 'application/json',
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
  createDeal,
  updateDeal,
  deleteDeal,
  addDealComment,
  tfmDealSubmit,
};
