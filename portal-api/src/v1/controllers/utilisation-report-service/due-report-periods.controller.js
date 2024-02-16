const api = require('../../api');

/**
 * Calls the DTFS Central API to get a banks utilisation reports and
 * returns the report period for reports with status `REPORT_NOT_RECEIVED`
 */
const getDueReportPeriodsByBankId = async (req, res) => {
  try {
    const { bankId } = req.params;

    const notUploadedReports = await api.getUtilisationReports(bankId, { excludeNotUploaded: 'true' });
    const dueReportPeriods = notUploadedReports.map((notReceivedReport) => notReceivedReport.reportPeriod);

    return res.status(200).send(dueReportPeriods);
  } catch (error) {
    console.error('Cannot get due reports %s', error);
    return res.status(error.response?.status ?? 500).send({ message: 'Failed to get due reports' });
  }
};

module.exports = {
  getDueReportPeriodsByBankId,
};
