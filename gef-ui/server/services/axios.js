const { default: axios } = require('axios');
const { TIMEOUT, HEADERS } = require('@ukef/dtfs2-common');
require('dotenv').config();

const { PORTAL_API_URL, PORTAL_API_KEY } = process.env;
const VERSION = 'v1';

module.exports = axios.create({
  baseURL: `${PORTAL_API_URL}/${VERSION}`,
  headers: {
    Accept: 'application/json',
    [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    'x-api-key': PORTAL_API_KEY,
  },
  timeout: TIMEOUT.LONG,
});
