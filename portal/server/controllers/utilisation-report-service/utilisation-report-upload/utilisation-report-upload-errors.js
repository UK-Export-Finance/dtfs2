const { validateFilenameFormat } = require('./utilisation-report-validator');

const getUploadErrors = (req, res) => {
    const href = '#utilisation-report-file-upload';
  
    if (res?.locals?.fileUploadError) {
      const uploadErrorSummary = [
        {
          text: res?.locals?.fileUploadError?.text,
          href,
        },
      ];
      const uploadValidationError = res?.locals?.fileUploadError;
      return { uploadErrorSummary, uploadValidationError };
    }
  
    if (!req?.file) {
      const text = 'Please select a file';
      const uploadErrorSummary = [{ text, href }];
      const uploadValidationError = { text };
      return { uploadErrorSummary, uploadValidationError };
    }
  
    if (res?.locals?.virusScanFailed) {
      const text = 'The selected file could not be uploaded - try again';
      const uploadErrorSummary = [{ text, href }];
      const uploadValidationError = { text };
      return { uploadErrorSummary, uploadValidationError };
    }
  
    const { formattedReportPeriod } = req.session.utilisationReport;
    const filename = req.file.originalname;
    const { filenameError } = validateFilenameFormat(filename, formattedReportPeriod);
    if (filenameError) {
      const uploadErrorSummary = [{ text: filenameError, href }];
      const uploadValidationError = { text: filenameError };
      return { uploadErrorSummary, uploadValidationError };
    }
  
    return {};
  };

  module.exports = {
    getUploadErrors,
  }