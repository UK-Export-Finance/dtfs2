const { default: axios } = require('axios');
const { TIMEOUT, HEADERS } = require('@ukef/dtfs2-common');
require('dotenv').config();

const { PORTAL_API_URL, PORTAL_API_KEY, EXTERNAL_API_KEY, EXTERNAL_API_URL } = process.env;
const VERSION = 'v1';

/**
 * Creates an Axios instance for the Portal API with the specified base URL, headers, and timeout.
 */
const portalApi = axios.create({
  baseURL: `${PORTAL_API_URL}/${VERSION}`,
  headers: {
    Accept: HEADERS.CONTENT_TYPE.VALUES.JSON,
    [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    'x-api-key': PORTAL_API_KEY,
  },
  timeout: TIMEOUT.LONG,
});

/**
 * Creates an Axios instance for the External API with the specified base URL, headers, and timeout.
 */
const externalApi = axios.create({
  baseURL: `${EXTERNAL_API_URL}`,
  headers: {
    Accept: HEADERS.CONTENT_TYPE.VALUES.JSON,
    [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    'x-api-key': EXTERNAL_API_KEY,
  },
  timeout: TIMEOUT.LONG,
});

module.exports = {
  portalApi,
  externalApi,
};
