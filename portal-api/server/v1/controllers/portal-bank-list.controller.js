const { HttpStatusCode } = require('axios');
const api = require('../api');

/**
 * Express handler for `GET /v1/portal-bank-list`.
 *
 * Proxies the curated portal homepage bank list from `dtfs-central-api` so the
 * unauthenticated login page can render it without talking to central API directly.
 *
 * On success responds with `200` and the array of banks.
 *
 * On failure logs a single sanitised line (message, status, code — never the raw
 * error) and responds with the upstream status where available or `500` otherwise,
 * plus a generic body `{ status, message: 'Failed to get portal bank list' }`.
 *
 * @param {import('express').Request} _req - Express request. Unused; the endpoint takes no input.
 * @param {import('express').Response} res - Express response used to send the bank list or error body.
 * @returns {Promise<void>} Resolves once the response has been sent.
 */
const getPortalBankList = async (_req, res) => {
  try {
    const banks = await api.getPortalBankList();

    return res.status(HttpStatusCode.Ok).send(banks);
  } catch (error) {
    const status = error?.response?.status ?? HttpStatusCode.InternalServerError;
    const errorMessage = error?.message ?? 'Unknown error';
    const errorCode = error?.code ?? 'UNKNOWN';
    const message = 'Failed to get portal bank list';

    console.error('%s: %s (status: %s, code: %s)', message, errorMessage, status, errorCode);

    return res.status(status).send({ status, message });
  }
};

module.exports = {
  getPortalBankList,
};
