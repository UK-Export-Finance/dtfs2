const { saveUtilisationData } = require('../../../services/repositories/utilisation-data-repo');
const { saveUtilisationReportDetails, getUtilisationReportDetailsByBankIdMonthAndYear } = require('../../../services/repositories/utilisation-reports-repo');
const {
  validateUtilisationReportData,
  validateMonth,
  validateYear,
  validateFileInfo,
  validateBankId,
} = require('../../validation/utilisation-report-service/utilisation-report-validator');
const db = require('../../../drivers/db-client');

const validatePayload = (reportData, month, year, fileInfo, bankId) => {
  const validationErrors = validateUtilisationReportData(reportData);
  const monthValidationError = validateMonth(month);
  if (monthValidationError) validationErrors.push(monthValidationError);
  const yearValidationError = validateYear(year);
  if (yearValidationError) validationErrors.push(yearValidationError);
  const fileInfoValidationErrors = validateFileInfo(fileInfo);
  if (fileInfoValidationErrors.length) validationErrors.push(...fileInfoValidationErrors);
  const bankIdValidationError = validateBankId(bankId);
  if (bankIdValidationError) validationErrors.push(bankIdValidationError);
  return validationErrors;
};

const postUtilisationReportData = async (req, res) => {
  try {
    const { reportData, month, year, user, fileInfo } = req.body;
    const { bank } = user;

    // If there are any data type errors in the report data, return 400
    const validationErrors = validatePayload(reportData, month, year, fileInfo, bank.id);
    if (validationErrors.length > 0) {
      console.error('Failed to save utilisation report, validation errors: %O', validationErrors);
      return res.status(400).send(validationErrors);
    }

    const existingReport = await getUtilisationReportDetailsByBankIdMonthAndYear(bank.id, Number.parseInt(month, 10), Number.parseInt(year, 10));
    if (existingReport) {
      console.error('Utilisation report already exists for bank %s, month %d, year %d', bank.id, month, year);
      return res.status(409).send('Utilisation report already exists');
    }
    const client = await db.getClient();
    const session = client.startSession();
    let reportDetails;
    await session.withTransaction(async () => {
      reportDetails = await saveUtilisationReportDetails(month, year, fileInfo, user);
      await saveUtilisationData(reportData, month, year, bank, reportDetails?.reportId);
    });
    await session.endSession();
    return res.status(201).send({ dateUploaded: reportDetails.dateUploaded });
  } catch (error) {
    console.error('Failed to save utilisation report %O', error);
    return res.status(500).send('Failed to save utilisation report');
  }
};

module.exports = { postUtilisationReportData };
