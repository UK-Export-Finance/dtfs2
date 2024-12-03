const api = require('../../api');

/**
 * Calls the DTFS Central API to get a banks utilisation report schedule and
 * returns the next report period which will be due
 */
const getNextReportPeriodByBankId = async (req, res) => {
  try {
    const { bankId } = req.params;

    const nextReportPeriod = await api.getNextReportPeriodByBankId(bankId);

    return res.status(200).send(nextReportPeriod);
  } catch (error) {
    console.error('Cannot get next report period %s', error);
    return res.status(error.response?.status ?? 500).send({ message: 'Failed to get next report period' });
  }
};

module.exports = {
  getNextReportPeriodByBankId,
};
