import axios from 'axios';

require('dotenv').config();

const { BASE_URL } = process.env;
const VERSION = 'v1';

export default axios.create({
  baseURL: `${BASE_URL}/${VERSION}`,
  timeout: 1000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});
