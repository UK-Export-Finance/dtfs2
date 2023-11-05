const { getUtilisationReportDetails } = require('../../../services/repositories/utilisation-reports-repo');

const getUtilisationReports = async (req, res) => {
  try {
    const { bankId } = req.params;

    const utilisationReports = await getUtilisationReportDetails(bankId);

    res.status(200).send(utilisationReports);
  } catch (error) {
    console.error('Unable to get utilisation reports %s', error);
    res.status(500).send({ status: 500, message: 'Failed to get utilisation reports' });
  }
};

module.exports = {
  getUtilisationReports,
};
