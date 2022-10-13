const axios = require('axios');
require('dotenv').config();

const { DEAL_API_URL } = process.env;
const VERSION = 'v1';

module.exports = axios.create({
  baseURL: `${DEAL_API_URL}/${VERSION}`,
  timeout: 15 * 1000, // timeout after max 15 seconds
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});
