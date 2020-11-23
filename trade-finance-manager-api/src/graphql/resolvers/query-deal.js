const axios = require('axios');
const dealReducer = require('../reducers/deal');
require('dotenv').config();

// TODO move to something like
// dealApi.getDeal

const urlRoot = process.env.DEAL_API_URL;

// TEMP add manually for local, initial dev
const TEMP_TOKEN = '...';

const getDeal = async ({ _id }) => {
  const response = await axios({
    method: 'get',
    url: `${urlRoot}/v1/deals/${_id}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: TEMP_TOKEN,
    },
  }).catch((err) => err);

  return response.data;
};


const queryDeal = async (args) => {
  const dealResponse = await getDeal(args);

  return dealReducer(dealResponse.deal);
};

module.exports = queryDeal;
