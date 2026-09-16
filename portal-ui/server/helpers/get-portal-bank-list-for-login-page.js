const api = require('../api');

/**
 * Gets the bank list for the login page. Never rejects: any API error is
 * logged and swallowed, returning an empty array so the `/login` route can
 * stay `async` without a try/catch under Express 4.
 *
 * @returns {Promise<Array<{ _id: string, name: string, order: number }>>}
 */
const getPortalBankListForLoginPage = async () => {
  try {
    return await api.getPortalBankList();
  } catch (error) {
    const status = typeof error?.response?.status === 'number' ? error.response.status : 'unknown';
    const message = typeof error?.message === 'string' ? error.message : 'Unknown error';

    console.error('Failed to load portal bank list for login page: %s (status: %s)', message, status);

    return [];
  }
};

module.exports = {
  getPortalBankListForLoginPage,
};
