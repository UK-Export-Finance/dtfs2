const axios = require('axios');
require('dotenv').config();

//TODO 2 services need to talk to the same api; we end up writing basically the same code twice to achieve this
//  ... a binary repo to publish things to so we can share? ... local references in package.json?? 

const urlRoot = process.env.DEAL_API_URL;

const createDeal = async (deal) => {
  const response = await axios({
    method: 'post',
    url: `${urlRoot}/deal`,
    data: deal
  });

  return response.data;
};

module.exports = {
  createDeal
}
