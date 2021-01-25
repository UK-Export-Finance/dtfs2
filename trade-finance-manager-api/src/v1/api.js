const axios = require('axios');

require('dotenv').config();

const centralApiUrl = process.env.DTFS_CENTRAL_API;
const refDataUrl = process.env.REFERENCE_DATA_PROXY_URL;

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
    return { error: response };
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

const queryDeals = async (query, start = 0, pagesize = 0) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${centralApiUrl}/v1/tfm/deals/query`,
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
    return new Error('error with token');// do something proper here, but for now just reject failed logins..
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

module.exports = {
  findOneDeal,
  updateDeal,
  queryDeals,
  getPartyDbInfo,
};
