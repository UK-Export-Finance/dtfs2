const axios = require('axios');
require('dotenv').config();

const { DEAL_API_URL } = process.env;
const VERSION = 'v1';

module.exports = axios.create({
  baseURL: `${DEAL_API_URL}/${VERSION}`,
  timeout: 1000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});
