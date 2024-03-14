const api = require('../../api');
const sendEmail = require('../../email');
const { EMAIL_TEMPLATE_IDS, FILESHARES } = require('../../../constants');
const { formatDateForEmail } = require('../../helpers/formatDateForEmail');
const { uploadFile } = require('../../../drivers/fileshare');
const { formatFilenameForSharepoint } = require('../../../utils');

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
  await sendEmail(EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_NOTIFICATION, PDC_INPUTTERS_EMAIL_RECIPIENT, {
    bankName,
    reportPeriod,
  });
};

/**
 * Sends notification email to bank payment officer team that a utilisation report has been
 * received and return the payment officer team email address.
 * @param {string} reportPeriod - period for which the report covers as a string, eg. June 2023
 * @param {string} bankId - the bank ID
 * @param {Date} submittedDate - the date the report was submitted
 * @param {string} submittedBy - the name of the user who submitted the report as a string
 * @returns {Promise} returns object with payment officer email or an error
 */
const sendEmailToBankPaymentOfficerTeam = async (reportPeriod, bankId, submittedDate, user) => {
  try {
    const reportSubmittedBy = `${user.firstname} ${user.surname}`;
    const { teamName, email } = await getPaymentOfficerTeamDetailsFromBank(bankId);
    const formattedSubmittedDate = formatDateForEmail(submittedDate);

    await sendEmail(EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_CONFIRMATION, email, {
      recipient: teamName,
      reportPeriod,
      reportSubmittedBy,
      reportSubmittedDate: formattedSubmittedDate,
    });
    return { paymentOfficerEmail: email };
  } catch (error) {
    console.error('Unable to get payment officer team details and send email %s', error);
    return { status: error?.code || 500, data: 'Failed to get payment officer team details and send email' };
  }
};

/**
 * Saves file to Azure in utilisation-reports ShareClient, returns the file storage info
 * @param {object} file
 * @param {string} bankId - bank id as a string
 * @returns {Promise<object>} - azure storage details with folder & file name, full path & url.
 */
const saveFileToAzure = async (file, bankId) => {
  try {
    console.info(`Attempting to save utilisation report to Azure for bank: ${bankId}`);
    const { originalname, buffer } = file;

    const fileInfo = await uploadFile({
      fileshare: FILESHARES.UTILISATION_REPORTS,
      folder: bankId,
      filename: formatFilenameForSharepoint(originalname),
      buffer,
      allowOverwrite: true,
    });

    if (!fileInfo || fileInfo.error) {
      throw new Error(`Failed to save utilisation report to Azure - ${fileInfo?.error?.message ?? 'cause unknown'}`);
    }

    console.info(`Successfully saved utilisation report to Azure for bank: ${bankId}`);
    return fileInfo;
  } catch (error) {
    console.error('Failed to save utilisation report to Azure ', error);
    throw error;
  }
};

const uploadReportAndSendNotification = async (req, res) => {
  try {
    const { file } = req;

    const { formattedReportPeriod, reportData, reportPeriod, user } = req.body;
    const parsedReportData = JSON.parse(reportData);
    const parsedUser = JSON.parse(user);
    const parsedReportPeriod = JSON.parse(reportPeriod);

    if (!file) {
      return res.status(400).send();
    }

    const bankId = parsedUser?.bank?.id;

    const existingReports = await api.getUtilisationReports(bankId, {
      reportPeriod: parsedReportPeriod,
      excludeNotReceived: true,
    });

    if (existingReports.length !== 1) {
      return res.status(500).send(`Expected 1 report but found ${existingReports.length} with bank ID ${bankId} and report period '${parsedReportPeriod}'`);
    }

    const existingReport = existingReports[0];

    const fileInfo = await saveFileToAzure(file, bankId);

    const azureFileInfo = {
      ...fileInfo,
      mimetype: file.mimetype,
    };

    const saveDataResponse = await api.saveUtilisationReport(existingReport.id, parsedReportData, parsedUser, azureFileInfo);

    await sendEmailToPdcInputtersEmail(parsedUser?.bank?.name, formattedReportPeriod);
    const { paymentOfficerEmail } = await sendEmailToBankPaymentOfficerTeam(
      formattedReportPeriod,
      parsedUser?.bank?.id,
      new Date(saveDataResponse.dateUploaded),
      parsedUser,
    );
    return res.status(201).send({ paymentOfficerEmail });
  } catch (error) {
    console.error('Failed to save utilisation report: %O', error);
    return res.status(error.response?.status ?? 500).send('Failed to save utilisation report');
  }
};

module.exports = {
  uploadReportAndSendNotification,
  saveFileToAzure,
};
