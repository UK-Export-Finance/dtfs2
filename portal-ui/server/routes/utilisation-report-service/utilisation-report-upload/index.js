const express = require('express');
const multer = require('multer');
const { ROLES } = require('@ukef/dtfs2-common');
const {
  getUtilisationReportUpload,
  postUtilisationReportUpload,
  getReportConfirmAndSend,
  postReportConfirmAndSend,
  getReportConfirmation,
} = require('../../../controllers/utilisation-report-service');
const { validateRole, validateToken, virusScanUpload } = require('../../middleware');
const { utilisationReportMulterFilter, formatBytes } = require('../../../utils/multer-filter.utils');

const { UTILISATION_REPORT_MAX_FILE_SIZE_BYTES } = process.env;

const router = express.Router();

const upload = multer({
  limits: { fileSize: +UTILISATION_REPORT_MAX_FILE_SIZE_BYTES },
  fileFilter: utilisationReportMulterFilter,
}).single('utilisation-report-file-upload');

/**
 * @openapi
 * /utilisation-report-upload:
 *   get:
 *     summary: GET utilisation-report-upload route.
 *     tags: [Portal]
 *     description: GET utilisation-report-upload route.
 *     responses:
 *       200:
 *         description: Ok
 *       401:
 *         description: Unauthorised insertion
 *       500:
 *         description: Internal server error
 */
router.get('/utilisation-report-upload', [validateToken, validateRole({ role: [ROLES.PAYMENT_REPORT_OFFICER] })], (req, res) =>
  getUtilisationReportUpload(req, res),
);

/**
 * @openapi
 * /utilisation-report-upload:
 *   post:
 *     summary: POST for utilisation report upload
 *     tags: [Portal]
 *     description: POST for utilisation report upload
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       500:
 *         description: Internal server error
 */
router.post(
  '/utilisation-report-upload',
  [validateToken, validateRole({ role: [ROLES.PAYMENT_REPORT_OFFICER] })],
  (req, res, next) => {
    upload(req, res, (error) => {
      if (!error) {
        return next(); // if there are no errors, then continue with the file upload
      }
      if (error.code === 'LIMIT_FILE_SIZE') {
        res.locals.fileUploadError = {
          text: `The selected file must be smaller than ${formatBytes(parseInt(UTILISATION_REPORT_MAX_FILE_SIZE_BYTES, 10))}`,
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

/**
 * @openapi
 * /utilisation-report-upload/confirm-and-send:
 *   get:
 *     summary: GET utilisation-report-upload/confirm-and-send route.
 *     tags: [Portal]
 *     description: GET utilisation-report-upload/confirm-and-send route.
 *     responses:
 *       200:
 *         description: Ok
 *       401:
 *         description: Unauthorised insertion
 *       500:
 *         description: Internal server error
 */
router.get('/utilisation-report-upload/confirm-and-send', [validateToken, validateRole({ role: [ROLES.PAYMENT_REPORT_OFFICER] })], (req, res) =>
  getReportConfirmAndSend(req, res),
);

/**
 * @openapi
 * /utilisation-report-upload/confirm-and-send:
 *   post:
 *     summary: POST utilisation-report-upload/confirm-and-send route.
 *     tags: [Portal]
 *     description: POST utilisation-report-upload/confirm-and-send route.
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       500:
 *         description: Internal server error
 */
router.post('/utilisation-report-upload/confirm-and-send', [validateToken, validateRole({ role: [ROLES.PAYMENT_REPORT_OFFICER] })], (req, res) =>
  postReportConfirmAndSend(req, res),
);

/**
 * @openapi
 * /utilisation-report-upload/confirmation:
 *   get:
 *     summary: GET utilisation-report-upload/confirmation route.
 *     tags: [Portal]
 *     description: GET utilisation-report-upload/confirmation route.
 *     responses:
 *       200:
 *         description: Ok
 *       401:
 *         description: Unauthorised insertion
 *       500:
 *         description: Internal server error
 */
router.get('/utilisation-report-upload/confirmation', [validateToken, validateRole({ role: [ROLES.PAYMENT_REPORT_OFFICER] })], (req, res) =>
  getReportConfirmation(req, res),
);

module.exports = router;
