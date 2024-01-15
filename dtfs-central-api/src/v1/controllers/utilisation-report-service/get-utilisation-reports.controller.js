const {
  getUtilisationReportDetailsByBankId,
  getUtilisationReportDetailsByBankIdMonthAndYear,
} = require('../../../services/repositories/utilisation-reports-repo');

const getUtilisationReports = async (req, res) => {
  try {
    const { bankId } = req.params;
    const { reportPeriod } = req.body;

    if (reportPeriod) {
      const utilisationReport = await getUtilisationReportDetailsByBankIdMonthAndYear(bankId, reportPeriod.start.month, reportPeriod.start.year);
      const utilisationReports = utilisationReport ? [utilisationReport] : [];
      return res.status(200).send(utilisationReports);
    }
    
    const utilisationReports = await getUtilisationReportDetailsByBankId(bankId);
    return res.status(200).send(utilisationReports);
  } catch (error) {
    console.error('Unable to get utilisation reports:', error);
    return res.status(500).send({ status: 500, message: 'Failed to get utilisation reports' });
  }
};

module.exports = {
  getUtilisationReports,
};
