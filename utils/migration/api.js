const axios = require('axios');
require('dotenv').config();

const urlRoot = process.env.DEAL_API_URL;

const createUser = async (user) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/v1/users`,
    data: user,
  }).catch(() => ({ data: { success: false, username: user.username } }));

  return response.data;
};

const listUsers = async () => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/v1/users`,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data.users;
};

module.exports = {
  createUser,
  listUsers,
};
