const express = require('express');
const multer = require('multer');
const {
  getUtilisationReportUpload,
  postUtilisationReportUpload,
  getReportConfirmAndSend,
  postReportConfirmAndSend,
  getReportConfirmation,
} = require('../../../controllers/utilisation-report-service');
const { validateRole, validateToken, virusScanUpload } = require('../../middleware');
const { utilisationReportMulterFilter, formatBytes } = require('../../../utils/multer-filter.utils');
const { ROLES, LANDING_PAGES } = require('../../../constants');

const { MAX_UTILISATION_REPORT_FILE_SIZE_BYTES } = process.env;

const router = express.Router();

const upload = multer({ limits: { fileSize: +MAX_UTILISATION_REPORT_FILE_SIZE_BYTES }, fileFilter: utilisationReportMulterFilter }).single(
  'utilisation-report-file-upload',
);

router.get(
  LANDING_PAGES.UTILISATION_REPORT_UPLOAD,
  [validateToken, validateRole({ role: [ROLES.PAYMENT_REPORT_OFFICER] })],
  (req, res) => getUtilisationReportUpload(req, res),
);

router.post(
  LANDING_PAGES.UTILISATION_REPORT_UPLOAD,
  [validateToken, validateRole({ role: [ROLES.PAYMENT_REPORT_OFFICER] })],
  (req, res, next) => {
    upload(req, res, (error) => {
      if (!error) {
        return next(); // if there are no errors, then continue with the file upload
      }
      if (error.code === 'LIMIT_FILE_SIZE') {
        res.locals.fileUploadError = {
          text: `The selected file must be smaller than ${formatBytes(parseInt(MAX_UTILISATION_REPORT_FILE_SIZE_BYTES, 10))}`,
        };
      } else {
        res.locals.fileUploadError = {
          text: error.message,
        };
      }
      return next();
    });
  },
  virusScanUpload,
  (req, res) => postUtilisationReportUpload(req, res),
);

router.get(`${LANDING_PAGES.UTILISATION_REPORT_UPLOAD}/confirm-and-send`, [validateToken, validateRole({ role: [ROLES.PAYMENT_REPORT_OFFICER] })], (req, res) =>
  getReportConfirmAndSend(req, res),
);

router.post(`${LANDING_PAGES.UTILISATION_REPORT_UPLOAD}/confirm-and-send`, [validateToken, validateRole({ role: [ROLES.PAYMENT_REPORT_OFFICER] })], (req, res) =>
  postReportConfirmAndSend(req, res),
);

router.get(`${LANDING_PAGES.UTILISATION_REPORT_UPLOAD}/confirmation`, [validateToken, validateRole({ role: [ROLES.PAYMENT_REPORT_OFFICER] })], (req, res) =>
  getReportConfirmation(req, res),
);

module.exports = router;
