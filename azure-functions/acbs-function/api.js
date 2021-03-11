const axios = require('axios');

require('dotenv').config();

const postToACBS = async (type, acbsInput) => {
  const response = await axios({
    method: 'post',
    url: `${process.env.MULESOFT_API_UKEF_TF_EA_URL}/${type}`,
    auth: {
      username: process.env.MULESOFT_API_KEY,
      password: process.env.MULESOFT_API_SECRET,
    },
    headers: {
      'Content-Type': 'application/json',
    },
    data: [acbsInput],
  }).catch((err) => err.response);

  return response.data;
};

const createParty = (acbsInput) => postToACBS('party', acbsInput);

const createDeal = (acbsInput) => postToACBS('deal', acbsInput);

module.exports = {
  createParty,
  createDeal,
};
