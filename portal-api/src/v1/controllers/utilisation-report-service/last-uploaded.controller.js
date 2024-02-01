const api = require('../../api');
const { UTILISATION_REPORT_RECONCILIATION_STATUS } = require('../../../constants');

const getLastUploadedReportByBankId = async (req, res) => {
  try {
    const { bankId } = req.params;

    const nonNotReceivedStatuses = Object.values(UTILISATION_REPORT_RECONCILIATION_STATUS).filter(
      (status) => status !== UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
    );
    const uploadedReports = (
      await api.getUtilisationReports(bankId, {
        reportStatuses: nonNotReceivedStatuses,
      })
    ).filter((report) => report.azureFileInfo !== null);

    const lastUploadedReport = uploadedReports.at(-1);
    if (uploadedReports.length === 0 || !lastUploadedReport) {
      throw new Error(`Failed to find any uploaded reports for bank with id ${bankId}`);
    }

    return res.status(200).send(lastUploadedReport);
  } catch (error) {
    console.error('Unable to get last uploaded report %O', error);
    return res.status(error.response?.status ?? 500).send({ message: 'Failed to get last uploaded report' });
  }
};

module.exports = {
  getLastUploadedReportByBankId,
};
