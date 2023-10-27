const { saveUtilisationData } = require('../../../services/repositories/utilisation-data-repo');
const { saveUtilisationReportDetails } = require('../../../services/repositories/utilisation-reports-repo');
const {
  validateUtilisationReportData,
  validateMonth,
  validateYear,
  validateFilePath,
} = require('../../validation/utilisation-report-service/utilisation-report-validator');

const validatePayload = (reportData, month, year, filePath) => {
  const validationErrors = validateUtilisationReportData(reportData);
  const monthValidationError = validateMonth(month);
  if (monthValidationError) validationErrors.push(monthValidationError);
  const yearValidationError = validateYear(year);
  if (yearValidationError) validationErrors.push(yearValidationError);
  const filePathValidationError = validateFilePath(filePath);
  if (filePathValidationError) validationErrors.push(filePathValidationError);
  return validationErrors;
};

const putUtilisationReportData = async (req, res) => {
  try {
    const {
      reportData, month, year, user, filePath
    } = req.body;
    const { bank } = user;

    // If the are any data type errors in the report data, return 400
    const validationErrors = validatePayload(reportData, month, year, filePath);
    if (validationErrors.length > 0) {
      console.error('Failed to save utilisation report, validation errors: %O', validationErrors);
      return res.status(400).send(validationErrors);
    }

    // TODO: FN-967 want to 429 here if a report details already exists
    const reportDetails = await saveUtilisationReportDetails(bank, month, year, filePath, user);
    await saveUtilisationData(reportData, month, year, bank, reportDetails.reportId);
    return res.status(201).send({ dateUploaded: reportDetails.dateUploaded });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Failed to save utilisation report');
  }
};

module.exports = { putUtilisationReportData };
