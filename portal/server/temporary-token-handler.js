const axios = require('axios');
require('dotenv').config();

const urlRoot = process.env.DEAL_API_URL;

module.exports = async (user) => {
  await axios({
    method: 'post',
    url: `${urlRoot}/api/users`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: user,
  });

  const { data } = await axios({
    method: 'post',
    url: `${urlRoot}/api/login`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: { username: user.username, password: user.password },
  });

  const { token } = data;

  return token;
};
