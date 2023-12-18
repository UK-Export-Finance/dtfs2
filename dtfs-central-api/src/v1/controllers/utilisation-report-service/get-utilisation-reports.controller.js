const {
  getUtilisationReportDetailsByBankId,
  getUtilisationReportDetailsByBankIdMonthAndYear,
} = require('../../../services/repositories/utilisation-reports-repo');

const getUtilisationReports = async (req, res) => {
  try {
    const { bankId } = req.params;

    const { month, year } = req.query;

    let utilisationReports;
    if (month && year) {
      const utilisationReport = await getUtilisationReportDetailsByBankIdMonthAndYear(bankId, Number.parseInt(month, 10), Number.parseInt(year, 10));
      utilisationReports = utilisationReport ? [utilisationReport] : [];
    } else {
      utilisationReports = await getUtilisationReportDetailsByBankId(bankId);
    }

    res.status(200).send(utilisationReports);
  } catch (error) {
    console.error('Unable to get utilisation reports:', error);
    res.status(500).send({ status: 500, message: 'Failed to get utilisation reports' });
  }
};

module.exports = {
  getUtilisationReports,
};
