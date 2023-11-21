const api = require('../../api');

const getLatestReport = async (req, res) => {
  try {
    const { bankId } = req.params;

    const reports = await api.getUtilisationReports(bankId);
    const latestReport = reports.at(-1);

    res.status(200).send(latestReport);
  } catch (error) {
    console.error('Cannot get latest report %s', error);
    res.status(error.response?.status ?? 500).send({ message: 'Failed to get latest report' });
  }
};

module.exports = {
  getLatestReport,
};
