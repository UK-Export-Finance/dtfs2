const { HttpStatusCode } = require('axios');
const api = require('../api');

/**
 * Express handler for `GET /v1/portal-bank-list`.
 * Proxies the curated portal homepage bank list from `dtfs-central-api` so the
 * unauthenticated login page can render it without talking to central API directly.
 */
const getPortalBankList = async (_req, res) => {
  try {
    const banks = await api.getPortalBankList();

    return res.status(HttpStatusCode.Ok).send(banks);
  } catch (error) {
    const status = typeof error?.response?.status === 'number' ? error.response.status : HttpStatusCode.InternalServerError;
    const errorMessage = typeof error?.message === 'string' ? error.message : 'Unknown error';
    const errorCode = typeof error?.code === 'string' ? error.code : 'UNKNOWN';
    const message = 'Failed to get portal bank list';

    console.error('%s: %s (status: %s, code: %s)', message, errorMessage, status, errorCode);

    return res.status(status).send({ status, message });
  }
};

module.exports = {
  getPortalBankList,
};
