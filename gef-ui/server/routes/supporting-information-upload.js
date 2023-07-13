const express = require('express');
const multer = require('multer');
const { multerFilter } = require('../utils/multer-filter.utils');
const {
  uploadSupportingDocument, deleteSupportingDocument,
} = require('../controllers/supporting-information/supporting-documents');
const { validateRole, validateToken, validateBank } = require('../middleware');

// The following routes cannot use the same csrf checks as the rest of the routes
// as the Ministry of Justice multi-file-upload component does not allow passing tokens to the request body.
// So we instead make a separate uploadCsrf token and check it here.
const router = express.Router();

const checkUploadCsrfToken = (req, res, next) => {
  if (req.session.uploadCsrf
    && req.query.uploadCsrf
    && req.session.uploadCsrf === req.query.uploadCsrf) {
    next();
  } else {
    console.error(`Error! CSRF tokens do not match.\nSESSION VALUE: ${req.session.uploadCsrf}.\nQUERY VALUE: ${req.query.uploadCsrf}`);
  }
};

const addFilesToRequestBody = multer({ fileFilter: multerFilter }).single('documents');
const processUploadRequest = (req, res, next) => {
  // eslint-disable-next-line consistent-return
  addFilesToRequestBody(req, res, (err) => {
    if (!err) {
      next();
    } else {
      return res.status(200).send({ file: err.file, error: { message: err.message } });
    }
  });
};

router.post(
  '/application-details/:dealId/supporting-information/document/:documentType/upload',
  [checkUploadCsrfToken, validateToken, validateBank, validateRole({ role: ['maker'] }), processUploadRequest],
  uploadSupportingDocument,
);
router.post(
  '/application-details/:dealId/supporting-information/document/:documentType/delete',
  [validateToken, validateBank, validateRole({ role: ['maker'] })],
  deleteSupportingDocument,
);

module.exports = router;
