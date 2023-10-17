const sendEmail = require('../../email');
const { EMAIL_TEMPLATE_IDS } = require('../../../constants');

const { PDC_INPUTTERS_EMAIL_RECIPIENT } = process.env;

const sendEmailToPdcInputtersEmail = async (bankName, month, year) => {
  await sendEmail(
    EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_NOTIFICATION,
    PDC_INPUTTERS_EMAIL_RECIPIENT,
    {
      bankName,
      reportPeriod: `${month} ${year}`,
    },
  );
};

const uploadReportAndSendNotification = async (req, res) => {
  const { bankName, month, year } = req.body;
  try {
    // TODO FN-1103 save file
    sendEmailToPdcInputtersEmail(bankName, month, year);
    // TODO FN-1103 change what is sent in the response
    res.status(200).send(true);
  } catch (error) {
    console.error('Unable to upload report and send notifications');
  }
};

module.exports = { uploadReportAndSendNotification };
