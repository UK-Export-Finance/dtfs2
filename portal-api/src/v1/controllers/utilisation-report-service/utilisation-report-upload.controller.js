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
      bankName,
      reportPeriod: `${month} ${year}`,
    },
  );
};

const sendEmailToBankPaymentOfficerTeam = async (month, year, bankId, submittedDateUtc, submittedBy) => {
  const { teamName, email } = await getPaymentOfficerTeamDetailsFromBank(bankId);
  const submittedDate = new Date(submittedDateUtc);
  const formattedDate = submittedDate.toLocaleDateString('en-GB', {year: 'numeric', month: 'long', day: 'numeric'});
  const formattedTime = submittedDate.toLocaleTimeString('en-GB', { hour12: true, hour: 'numeric', minute: 'numeric'});
  // TODO update the reportSubmittedDate format here
  await sendEmail(
    EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_CONFIRMATION,
    email,
    {
      recipient: teamName,
      reportPeriod: `${month} ${year}`,
      reportSubmittedBy: submittedBy,
      reportSubmittedDate: `${formattedDate} at ${formattedTime}`,
    },
  );
};

const uploadReportAndSendNotification = async (req, res) => {
  const { bankName, month, year, submittedBy, bankId } = req.body;
  const submittedDateUtc = new Date().toISOString();
  try {
    // TODO FN-1103 save file
    sendEmailToPdcInputtersEmail(bankName, month, year);
    sendEmailToBankPaymentOfficerTeam(month, year, bankId, submittedDateUtc, submittedBy);
    // TODO FN-1103 change what is sent in the response
    res.status(200).send(true);
  } catch (error) {
    console.error('Unable to upload report and send notifications');
  }
};

module.exports = { uploadReportAndSendNotification };
