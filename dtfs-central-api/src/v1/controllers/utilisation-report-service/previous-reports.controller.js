const { getUtilisationReportDetails, getUtilisationReportDetailsForMonthAndYear } = require('../../../services/repositories/utilisation-reports-repo');

const getUtilisationReports = async (req, res) => {
  try {
    const { bankId } = req.params;

    const { month, year } = req.query;

    let utilisationReports;
    if (month && year) {
      const utilisationReport = await getUtilisationReportDetailsForMonthAndYear(bankId, month, year);
      utilisationReports = utilisationReport ? [utilisationReport] : [];
    } else {
      utilisationReports = await getUtilisationReportDetails(bankId);
    }

    res.status(200).send(utilisationReports);
  } catch (error) {
    console.error('Unable to get utilisation reports: ', error);
    res.status(500).send({ status: 500, message: 'Failed to get utilisation reports' });
  }
};

module.exports = {
  getUtilisationReports,
};
