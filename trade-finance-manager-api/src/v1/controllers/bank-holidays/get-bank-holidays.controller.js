const api = require('../../api');

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
