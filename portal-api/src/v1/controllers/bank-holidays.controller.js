const externalApi = require('../../external-api/api');

const getBankHolidays = async (req, res) => {
  try {
    const bankHolidays = await externalApi.bankHolidays.getBankHolidays();
    res.status(200).send(bankHolidays);
  } catch (error) {
    console.error('Unable to get UK bank holidays %o', error);
    res.status(500).send({ status: 500, message: 'Failed to get UK bank holidays' });
  }
};

module.exports = {
  getBankHolidays,
};
