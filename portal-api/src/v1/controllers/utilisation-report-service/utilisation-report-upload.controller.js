const api = require('../../api');

const uploadReport = async (req, res) => {
  try {
    const { reportData, month, year, user } = req.body;
    const parsedReportData = JSON.parse(reportData);
    const parsedUser = JSON.parse(user);

    // TODO: FN-967 save file to azure
    // const file = req.file;

    // if (!file) return res.status(400).send();
    // const path = await saveFileToAzure(req.file, month, year, bank);

    const saveDataResponse = await api.saveUtilisationReport(parsedReportData, month, year, parsedUser, 'a file path');

    if (saveDataResponse.status !== 201) {
      const status = saveDataResponse.status || 500;
      console.error('Failed to save utilisation report: %O', saveDataResponse);
      return res.status(status).send({ status, data: 'Failed to save utilisation report' });
    }

    return res.status(200).send({ status: 200, data: 'Successfully saved utilisation report' });
  } catch (error) {
    console.error('Failed to save utilisation report: %O', error);
    return res.status(500).send({ status: 500, data: 'Failed to save utilisation report' });
  }
};

module.exports = { uploadReport };
