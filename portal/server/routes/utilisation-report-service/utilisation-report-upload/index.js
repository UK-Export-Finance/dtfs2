const express = require('express');
const multer = require('multer');
const { getUtilisationReportUpload, postUtilisationReportUpload } = require('../../../controllers/utilisation-report-service');
const { validateRole, validateToken } = require('../../middleware');
const { utilisationReportMulterFilter, formatBytes } = require('../../../utils/multer-filter.utils');
const { FILE_UPLOAD } = require('../../../constants');

const router = express.Router();

const upload = multer({ limits: { fileSize: FILE_UPLOAD.MAX_FILE_SIZE }, fileFilter: utilisationReportMulterFilter }).single('utilisation-report-file-upload');

// TODO FN-955 update role to payment officer
router.get('/utilisation-report-upload', [validateToken, validateRole({ role: ['maker'] })], (req, res) => getUtilisationReportUpload(req, res));

router.post(
  '/utilisation-report-upload',
  // TODO FN-955 update role to payment officer
  [validateToken, validateRole({ role: ['maker'] })],
  (req, res, next) => {
    upload(req, res, (error) => {
      if (!error) {
        return next(); // if there are no errors, then continue with the file upload
      }
      if (error.code === 'LIMIT_FILE_SIZE') {
        res.locals.fileUploadError = {
          text: `File too large, must be smaller than ${formatBytes(FILE_UPLOAD.MAX_FILE_SIZE)}`,
        };
      } else {
        res.locals.fileUploadError = {
          text: error.message,
        };
      }
      return next();
    });
  },
  (req, res) => postUtilisationReportUpload(req, res),
);

module.exports = router;
