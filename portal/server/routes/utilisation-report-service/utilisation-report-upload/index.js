const express = require('express');
const multer = require('multer');
const {
  getUtilisationReportUpload,
  postUtilisationReportUpload,
  getReportConfirmAndSend,
  postReportConfirmAndSend,
  getReportConfirmation,
} = require('../../../controllers/utilisation-report-service');
const { validateRole, validateToken } = require('../../middleware');
const { utilisationReportMulterFilter, formatBytes } = require('../../../utils/multer-filter.utils');
const { FILE_UPLOAD, ROLES } = require('../../../constants');

const router = express.Router();

const upload = multer({ limits: { fileSize: FILE_UPLOAD.MAX_FILE_SIZE }, fileFilter: utilisationReportMulterFilter }).single('utilisation-report-file-upload');

router.get('/utilisation-report-upload', [validateToken, validateRole({ role: ['payment-officer'] })], (req, res) => getUtilisationReportUpload(req, res));

router.post(
  '/utilisation-report-upload',
  [validateToken, validateRole({ role: ['payment-officer'] })],
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

router.get('/utilisation-report-upload/confirm-and-send', [validateToken, validateRole({ role: [ROLES.PAYMENT_OFFICER] })], (req, res) => getReportConfirmAndSend(req, res));
router.post('/utilisation-report-upload/confirm-and-send', [validateToken, validateRole({ role: [ROLES.PAYMENT_OFFICER] })], (req, res) => postReportConfirmAndSend(req, res));

router.get('/utilisation-report-upload/confirmation', [validateToken, validateRole({ role: [ROLES.PAYMENT_OFFICER] })], (req, res) => getReportConfirmation(req, res));

module.exports = router;
