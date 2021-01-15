const axios = require('axios');

require('dotenv').config();

const urlRoot = process.env.DTFS_CENTRAL_API;

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

module.exports = {
  findOneDeal,
  queryDeals,
};
