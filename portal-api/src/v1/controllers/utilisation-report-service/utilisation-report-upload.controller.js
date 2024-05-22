const { getFormattedReportPeriodWithLongMonth } = require('@ukef/dtfs2-common');
const { saveUtilisationReportFileToAzure } = require('../../services/utilisation-report/azure-file-service');
const {
  sendUtilisationReportUploadNotificationEmailToUkefGefReportingTeam,
  sendUtilisationReportUploadConfirmationEmailToBankPaymentOfficerTeam,
} = require('../../services/utilisation-report/email-service');
const { validateReportIsInReportNotReceivedState } = require('../../validation/utilisation-report/utilisation-report-validator');
const api = require('../../api');
const { InvalidReportStatusError } = require('../../errors');

/**
 * Fetches report for bank for given report period
 * @param {string} bankId
 * @param {import('@ukef/dtfs2-common').ReportPeriod} reportPeriod
 */
const getReportByBankIdAndReportPeriod = async (bankId, reportPeriod) => {
  const reportsForPeriod = await api.getUtilisationReports(bankId, {
    reportPeriod,
  });

  if (reportsForPeriod.length !== 1) {
    throw new Error(
      `Expected 1 report but found ${reportsForPeriod.length} with bank ID ${bankId} and report period '${getFormattedReportPeriodWithLongMonth(
        reportPeriod,
      )}'`,
    );
  }

  return reportsForPeriod[0];
};

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

    const report = await getReportByBankIdAndReportPeriod(bankId, parsedReportPeriod);
    validateReportIsInReportNotReceivedState(report);
    const azureFileInfo = await saveUtilisationReportFileToAzure(file, bankId);
    const { dateUploaded } = await api.saveUtilisationReport(report.id, parsedReportData, parsedUser, azureFileInfo);

    try {
      await sendUtilisationReportUploadNotificationEmailToUkefGefReportingTeam(parsedUser?.bank?.name, formattedReportPeriod);
    } catch (error) {
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
      return res.status(error.status).send(error.message);
    }
    console.error('Failed to save utilisation report: %o', error);
    return res.status(error.response?.status ?? 500).send('Failed to save utilisation report');
  }
};

module.exports = {
  uploadReportAndSendNotification,
};
