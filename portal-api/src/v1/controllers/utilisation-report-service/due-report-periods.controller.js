const api = require('../../api');
const { UTILISATION_REPORT_RECONCILIATION_STATUS } = require('../../../constants');

/**
 * Calls the DTFS Central API to get a banks utilisation reports and
 * returns the report period for reports with status `REPORT_NOT_RECEIVED`
 */
const getDueReportPeriodsByBankId = async (req, res) => {
  try {
    const { bankId } = req.params;

    const notReceivedReports = await api.getUtilisationReports(bankId, { reportStatuses: [UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED] });
    const dueReportPeriods = notReceivedReports.map((notReceivedReport) => notReceivedReport.reportPeriod);

    return res.status(200).send(dueReportPeriods);
  } catch (error) {
    console.error('Cannot get due reports %s', error);
    return res.status(error.response?.status ?? 500).send({ message: 'Failed to get due reports' });
  }
};

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
  getDueReportPeriodsByBankId,
  getNextReportPeriodByBankId,
};
