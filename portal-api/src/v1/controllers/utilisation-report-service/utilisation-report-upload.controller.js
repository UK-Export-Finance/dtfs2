const sendEmail = require('../../email');
const api = require('../../api');
const { EMAIL_TEMPLATE_IDS } = require('../../../constants');

const { PDC_INPUTTERS_EMAIL_RECIPIENT } = process.env;

const getPaymentOfficerTeamDetailsFromBank = async (bankId) => {
  const { data } = await api.getPaymentOfficerTeamDetailsFromBank(bankId);
  const { teamName, email } = data.paymentOfficerTeam;
  return { teamName, email };
};

const sendEmailToPdcInputtersEmail = async (bankName, month, year) => {
  await sendEmail(
    EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_NOTIFICATION,
    PDC_INPUTTERS_EMAIL_RECIPIENT,
    {
      bankName: bankName,
      reportPeriod: `${month} ${year}`,
    },
  );
};

const sendEmailToBankPaymentOfficerTeam = async (month, year, bankId, submittedDate, submittedBy) => {
  const { teamName, email } = await getPaymentOfficerTeamDetailsFromBank(bankId);
  // TODO update the reportSubmittedDate format here 
  await sendEmail(
    EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_CONFIRMATION,
    email,
    {
      recipient: teamName,
      reportPeriod: `${month} ${year}`,
      reportSubmittedBy: submittedBy,
      reportSubmittedDate: submittedDate.toLocaleString("en-GB", { timeZone: "GMT", weekday: "long", month: "long"}),
    },
  );
};

const uploadReportAndSendNotification = async (req, res) => {
  const { bankName, month, year, submittedBy, bankId } = req.body;
  const submittedDate = new Date();
  try {
    // TODO FN-1103 save file
    sendEmailToPdcInputtersEmail(bankName, month, year);
    sendEmailToBankPaymentOfficerTeam(month, year, bankId, submittedDate, submittedBy);
    // TODO FN-1103 change what is sent in the response
    res.status(200).send(true);
  } catch (error) {
    console.error('Unable to upload report and send notifications');
  }
};

module.exports = { uploadReportAndSendNotification };
