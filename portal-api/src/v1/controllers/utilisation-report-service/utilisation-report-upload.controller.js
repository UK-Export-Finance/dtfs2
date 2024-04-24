const { saveUtilisationReportFileToAzure } = require('../../services/utilisation-report/azure-file-service');
const {
  sendUtilisationReportUploadNotificationEmailToUkefGefReportingTeam,
  sendUtilisationReportUploadConfirmationEmailToBankPaymentOfficerTeam,
} = require('../../services/utilisation-report/email-service');
const { validateReportForPeriodIsInReportNotReceivedStateAndReturnId } = require('../../validation/utilisation-report/utilisation-report-upload-validator');
const api = require('../../api');
const { InvalidReportStatusError } = require('../../errors');

const uploadReportAndSendNotification = async (req, res) => {
  try {
    const { file } = req;

    if (!file) {
      return res.status(400).send();
    }

    const { formattedReportPeriod, reportData, reportPeriod, user } = req.body;
    const parsedReportData = JSON.parse(reportData);
    const parsedUser = JSON.parse(user);
    const parsedReportPeriod = JSON.parse(reportPeriod);
    const bankId = parsedUser?.bank?.id;

    const reportId = await validateReportForPeriodIsInReportNotReceivedStateAndReturnId(bankId, parsedReportPeriod);
    const azureFileInfo = await saveUtilisationReportFileToAzure(file, bankId);
    const { dateUploaded } = await api.saveUtilisationReport(reportId, parsedReportData, parsedUser, azureFileInfo);

    try {
      await sendUtilisationReportUploadNotificationEmailToUkefGefReportingTeam(parsedUser?.bank?.name, formattedReportPeriod);
    } catch(error) {
      console.error('Failed to send report upload notification to ukef gef reporting team %o', error);
    }
    const { paymentOfficerEmails } = await sendUtilisationReportUploadConfirmationEmailToBankPaymentOfficerTeam(
      formattedReportPeriod,
      parsedUser?.bank?.id,
      new Date(dateUploaded),
      parsedUser.firstname,
      parsedUser.surname,
    );
    return res.status(201).send({ paymentOfficerEmails });
  } catch (error) {
    if (error instanceof InvalidReportStatusError) {
      return res.status(500).send(error.message);
    }
    console.error('Failed to save utilisation report: %o', error);
    return res.status(error.response?.status ?? 500).send('Failed to save utilisation report');
  }
};

module.exports = {
  uploadReportAndSendNotification,
};
