const api = require('../../api');

/**
 * Get UK bank holidays from the external API.
 *
 * @param req - The request object containing the parameters, body, and user information.
 * @param res - The response object.
 * @returns Bank holidays in the response body.
 */
const getBankHolidays = async (req, res) => {
  try {
    const bankHolidays = await api.getBankHolidays();
    res.status(200).send(bankHolidays);
  } catch (error) {
    console.error('Unable to get UK bank holidays %o', error);
    res.status(error.response?.status ?? 500).send('Failed to get bank holidays');
  }
};

module.exports = getBankHolidays;
