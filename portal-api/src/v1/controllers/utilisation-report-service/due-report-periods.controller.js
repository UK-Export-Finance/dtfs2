const { UTILISATION_REPORT_STATUS } = require('@ukef/dtfs2-common');
const api = require('../../api');

/**
 * Calls the DTFS Central API to get a banks utilisation reports and
 * returns the report period for reports with status `REPORT_NOT_RECEIVED`
 */
const getDueReportPeriodsByBankId = async (req, res) => {
  try {
    const { bankId } = req.params;

    const notReceivedReports = (await api.getUtilisationReports(bankId)).filter((report) => report.status === UTILISATION_REPORT_STATUS.REPORT_NOT_RECEIVED);
    const dueReportPeriods = notReceivedReports.map((notReceivedReport) => notReceivedReport.reportPeriod);

    return res.status(200).send(dueReportPeriods);
  } catch (error) {
    console.error('Cannot get due reports %o', error);
    return res.status(error.response?.status ?? 500).send({ message: 'Failed to get due reports' });
  }
};

module.exports = {
  getDueReportPeriodsByBankId,
};
