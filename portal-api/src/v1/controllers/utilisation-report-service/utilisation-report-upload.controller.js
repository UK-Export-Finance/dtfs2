const sendEmail = require('../../email');
const { EMAIL_TEMPLATE_IDS } = require('../../../constants');

const { PDC_INPUTTERS_EMAIL_RECIPIENT } = process.env;

const sendEmailToPdcInputtersEmail = async (bankName, month, year) => {
  await sendEmail(
    EMAIL_TEMPLATE_IDS.NEW_UTILISATION_REPORT,
    PDC_INPUTTERS_EMAIL_RECIPIENT,
    {
      bank_name: bankName,
      report_month: `${month} ${year}`,
    },
  );
};

const uploadReportAndSendNotification = async (req, res) => {
  const { bankName, month, year } = req.body;
  try {
    // TODO FN-1103 save file
    sendEmailToPdcInputtersEmail(bankName, month, year);
    // TODO FN-1103 change what is sent in the response
    res.status(200).send(month);
  } catch (error) {
    console.error('Unable to upload report and send notifications');
  }
};

module.exports = { uploadReportAndSendNotification };
