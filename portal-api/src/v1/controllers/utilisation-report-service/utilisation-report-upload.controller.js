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
 * @returns {Promise<{fileInfo: object, error: boolean}>} - if file is not saved error is true, otherwise returning
 * azure storage details with folder & file name, full path & url.
 */
const saveFileToAzure = async (file, bankId) => {
  try {
    console.info(`Attempting to save utilisation report for bank: ${bankId}`);
    const { originalname, buffer } = file;

    const fileInfo = await uploadFile({
      fileshare: FILESHARES.UTILISATION_REPORTS,
      folder: bankId,
      filename: formatFilenameForSharepoint(originalname),
      buffer,
      allowOverwrite: true,
    });

    console.info(`Successfully saved utilisation report for bank: ${bankId}`);
    return { fileInfo, error: false };
  } catch (error) {
    console.error('Failed to save utilisation report: %O', error);
    return { fileInfo: null, error: true };
  }
};

const uploadReportAndSendNotification = async (req, res) => {
  try {
    const { file } = req;

    const { reportPeriod, reportData, month, year, user } = req.body;
    const parsedReportData = JSON.parse(reportData);
    const parsedUser = JSON.parse(user);

    if (!file) {
      return res.status(400).send();
    }

    // If a report for this month/year/bank combo already exists we should not overwrite it
    const existingReports = await api.getUtilisationReports(parsedUser?.bank?.id, month, year);
    if (existingReports.length > 0) {
      return res.status(409).send('Report already exists');
    }

    const { fileInfo, error } = await saveFileToAzure(file, parsedUser.bank.id);
    if (error) {
      const status = 500;
      return res.status(status).send({ status, data: 'Failed to save utilisation report to Azure' });
    }
    const azureFileInfo = {
      ...fileInfo,
      mimetype: file.mimetype,
    };

    const saveDataResponse = await api.saveUtilisationReport(parsedReportData, month, year, parsedUser, azureFileInfo);

    if (saveDataResponse.status !== 201) {
      const status = saveDataResponse.status || 500;
      console.error('Failed to save utilisation report: %O', saveDataResponse);
      return res.status(status).send({ status, data: 'Failed to save utilisation report' });
    }
    await sendEmailToPdcInputtersEmail(parsedUser?.bank?.name, reportPeriod);
    const { paymentOfficerEmail } = await sendEmailToBankPaymentOfficerTeam(
      reportPeriod,
      parsedUser?.bank?.id,
      new Date(saveDataResponse.data.dateUploaded),
      parsedUser
    );
    return res.status(201).send({ paymentOfficerEmail });
  } catch (error) {
    console.error('Failed to save utilisation report: %O', error);
    return res.status(500).send({ data: 'Failed to save utilisation report' });
  }
};

module.exports = {
  uploadReportAndSendNotification,
  saveFileToAzure,
};
