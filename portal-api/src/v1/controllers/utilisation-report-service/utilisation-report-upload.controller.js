const api = require('../../api');
const sendEmail = require('../../email');
const { EMAIL_TEMPLATE_IDS } = require('../../../constants');
const { getMonthName } = require('../../../utils/getMonthName');

const { PDC_INPUTTERS_EMAIL_RECIPIENT } = process.env;

const sendEmailToPdcInputtersEmail = async (bankName, month, year) => {
  await sendEmail(EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_NOTIFICATION, PDC_INPUTTERS_EMAIL_RECIPIENT, {
    bankName,
    reportPeriod: `${month} ${year}`,
  });
};

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

    const monthName = getMonthName(month);
    await sendEmailToPdcInputtersEmail(parsedUser?.bank?.name, monthName, year);

    return res.status(201).send();
  } catch (error) {
    console.error('Failed to save utilisation report: %O', error);
    return res.status(500).send({ status: 500, data: 'Failed to save utilisation report' });
  }
};

module.exports = { uploadReport };
