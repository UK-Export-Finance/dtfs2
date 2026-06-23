const api = require('../api');

/**
 * Gets the bank list for the login page and falls back to an empty list if the
 * API request fails.
 *
 * @returns {Promise<Array<{ _id: string, name: string, order: number }>>}
 *   Returns a list of banks to display on the login page, or an empty array if
 *   the API request fails.
 */
const getPortalBankListForLoginPage = async () => {
  try {
    return await api.getPortalBankList();
  } catch (error) {
    const status = typeof error?.response?.status === 'number' ? error.response.status : undefined;
    const message = typeof error?.message === 'string' ? error.message : 'Unknown error';

    console.error('Failed to load portal bank list for login page: %s (status: %s)', message, status);

    return [];
  }
};

module.exports = {
  getPortalBankListForLoginPage,
};
