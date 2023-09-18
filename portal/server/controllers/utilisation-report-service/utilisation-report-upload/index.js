const ExcelJS = require('exceljs');
const csv = require('csv-parser');
const { Readable } = require('stream');

const getUtilisationReportUpload = async (req, res) => {
  try {
    return res.render('utilisation-reporting-service/utilisation-report-upload/utilisation-report-upload.njk', {
      user: req.session.user,
      primaryNav: 'utilisation_report_upload',
    });
  } catch (error) {
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};

const postUtilisationReportUpload = async (req, res) => {
  try {
    let validationError;
    let errorSummary;
    if (res?.locals?.fileUploadError) {
      errorSummary = [
        {
          text: res?.locals?.fileUploadError?.text,
          href: '#utilisation-report-file-upload',
        },
      ];
      validationError = res?.locals?.fileUploadError;
    } else if (!req?.file) {
      errorSummary = [
        {
          text: 'You must upload a file',
          href: '#utilisation-report-file-upload',
        },
      ];
      validationError = { text: 'You must upload a file' };
    }
    if (validationError || errorSummary) {
      return res.render('utilisation-reporting-service/utilisation-report-upload/utilisation-report-upload.njk', {
        validationError,
        errorSummary,
        user: req.session.user,
        primaryNav: 'utilisation_report_upload',
      });
    }

    console.log(123123123);
    const { fileData, jsonData } = extractCsvData(req.file);
    // validateCsvData(csvData);
    if (errors) {
      return res.render('data-errors.njk');
    }
    saveFileToSession(csvFile);
    return res.render('utilisation-reporting-service/utilisation-report-upload/utilisation-report-upload.njk');
  } catch (error) {
    console.log(error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};

const saveFileToSession = (csvFile) => {
  return true;
};

module.exports = {
  getUtilisationReportUpload,
  postUtilisationReportUpload,
};
