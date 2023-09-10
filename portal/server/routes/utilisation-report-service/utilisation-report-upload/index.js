const express = require('express');
const multer = require('multer');
const { getUtilisationReportUpload, postUtilisationReportUpload } = require('../../../controllers/utilisation-report-service');
const { validateRole, validateToken } = require('../../middleware');

const router = express.Router();

const { FILE_UPLOAD } = require('../../../constants/file-upload');

// format file from bytes to MB/KB, etc
const formatBytes = (bytes, decimals = 2) => {
  if (!bytes) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
};

const multerFilter = (req, file, cb) => {
  const allowedFormatsRegex = new RegExp(`\\.(${FILE_UPLOAD.ALLOWED_FORMATS_UTILISATION_REPORT.join('|')})$`);
  if (file.originalname.match(allowedFormatsRegex)) {
    cb(null, true);
  } else {
    cb(
      {
        message: `${file.originalname} must be a ${FILE_UPLOAD.ALLOWED_FORMATS_UTILISATION_REPORT.join(', ').toUpperCase()}`,
        file,
      },
      false,
    );
  }
};

const upload = multer({ limits: { fileSize: FILE_UPLOAD.MAX_FILE_SIZE }, fileFilter: multerFilter }).any(); // single('utilisation-report-file-upload');

router.get('/utilisation-report-upload', [validateToken, validateRole({ role: ['maker'] })], (req, res) => getUtilisationReportUpload(req, res));

router.post(
  '/utilisation-report-upload',
  [validateToken, validateRole({ role: ['maker'] })],
  (req, res, next) => {
    upload(req, res, (error) => {
      // error looks like { message: '', file: {}}
      if (!error) {
        return next(); // if there are no errors, then continue with the file upload
      }
      if (error.code === 'LIMIT_FILE_SIZE') {
        res.locals.fileUploadError = {
          fieldName: error.field,
          error: { order: 1, text: `File too large, must be smaller than ${formatBytes(FILE_UPLOAD.MAX_FILE_SIZE)}` },
          summaryText: `File too large, must be smaller than ${formatBytes(FILE_UPLOAD.MAX_FILE_SIZE)}`,
          summaryHref: `#criterion-group-${error.field}`,
        };
      } else {
        res.locals.fileUploadError = {
          fieldName: error.file.fieldname,
          error: { order: 1, text: error.message },
          summaryText: error.message,
          summaryHref: `#criterion-group-${error.file.fieldname}`,
        };
      }
      return next();
    });
  },
  (req, res) => postUtilisationReportUpload(req, res),
);

module.exports = router;
