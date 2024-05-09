const api = require('../../api');

const getLastUploadedReportByBankId = async (req, res) => {
  try {
    const { bankId } = req.params;

    const uploadedReports = await api.getUtilisationReports(bankId, {
      excludeNotReceived: true,
    });

    const lastUploadedReport = uploadedReports.at(-1);
    if (!lastUploadedReport) {
      throw new Error(`Failed to find any uploaded reports for bank with id ${bankId}`);
    }

    return res.status(200).send(lastUploadedReport);
  } catch (error) {
    console.error('Unable to get last uploaded report %o', error);
    return res.status(error.response?.status ?? 500).send({ message: 'Failed to get last uploaded report' });
  }
};

module.exports = {
  getLastUploadedReportByBankId,
};
