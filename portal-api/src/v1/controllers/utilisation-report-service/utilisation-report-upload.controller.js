const sendEmail = require('../../email');
const api = require('../../api');
const { EMAIL_TEMPLATE_IDS } = require('../../../constants');
const { formatDateTimeForEmail } = require('../../helpers/covertUtcDateToDateTimeString');

const { PDC_INPUTTERS_EMAIL_RECIPIENT } = process.env;

/**
 * Calls the DTFS Central API to get bank details by bank ID and
 * returns only the payment officer team name and email
 * @param {string} bankId - the bank ID
 * @returns {Promise} payment officer team name and email
 */
const getPaymentOfficerTeamDetailsFromBank = async (bankId) => {
  try {
    const { data } = await api.getBankById(bankId);
    const { teamName, email } = data.paymentOfficerTeam;
    return { teamName, email };
  } catch (error) {
    console.error('Unable to get bank payment officer team details by ID %s', error);
    return { status: error?.code || 500, data: 'Failed to get bank payment officer team details by ID' };
  }
};

/**
 * Sends notification email to PDC Inputters that a utilisation report has been submitted
 * @param {string} bankName - name of the bank
 * @param {string} reportPeriod - period for which the report covers as a string, eg. June 2023
 */
const sendEmailToPdcInputtersEmail = async (bankName, reportPeriod) => {
  await sendEmail(
    EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_NOTIFICATION,
    PDC_INPUTTERS_EMAIL_RECIPIENT,
    {
      bankName,
      reportPeriod,
    },
  );
};

/**
 * Sends notification email to bank payment officer team that a utilisation report has been received
 * @param {string} reportPeriod - period for which the report covers as a string, eg. June 2023
 * @param {string} bankId - the bank ID
 * @param {string} submittedDateUtc - the date the report was submitted as a string
 * @param {string} submittedBy - the name of the user who submitted the report as a string
 */
const sendEmailToBankPaymentOfficerTeam = async (reportPeriod, bankId, submittedDateUtc, submittedBy) => {
  try {
    const { teamName, email } = await getPaymentOfficerTeamDetailsFromBank(bankId);
    const formattedSubmittedDate = formatDateTimeForEmail(submittedDateUtc);

    await sendEmail(
      EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_CONFIRMATION,
      email,
      {
        recipient: teamName,
        reportPeriod,
        reportSubmittedBy: submittedBy,
        reportSubmittedDate: formattedSubmittedDate,
      },
    );
    return { paymentOfficerEmail: email };
  } catch (error) {
    console.error('Unable to get payment officer team details and send email %s', error);
    return { status: error?.code || 500, data: 'Failed to get payment officer team details and send email' };
  }
};

const uploadReportAndSendNotification = async (req, res) => {
  try {
    const { bankName, reportPeriod, submittedBy, bankId } = req.body;
    const submittedDateUtc = new Date().toISOString();
    // TODO FN-1103 save file
    sendEmailToPdcInputtersEmail(bankName, reportPeriod);
    const { paymentOfficerEmail } = await sendEmailToBankPaymentOfficerTeam(reportPeriod, bankId, submittedDateUtc, submittedBy);
    // TODO this is failing
    req.session.utilisation_report = { paymentOfficerEmail };
    // TODO FN-1103 change what is sent in the response
    res.status(200).send(true);
  } catch (error) {
    console.error('Unable to upload report and send notifications %s', error);
  }
};

module.exports = {
  uploadReportAndSendNotification,
  formatDateTimeForEmail,
};
