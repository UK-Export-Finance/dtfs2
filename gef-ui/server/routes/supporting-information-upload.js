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

/**
 * Checks that the session uploadCsrf token matches the query uploadCsrf and that the query has not expired
 * If the token is valid move to the next middleware
 * If it is invalid return an error response
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
const validateUploadCsrfToken = (req, res, next) => {
  if (req.session.uploadCsrf
    && req.session.uploadCsrf.token === req.query.uploadCsrf
    && new Date() < new Date(req.session.uploadCsrf.expiry)) {
    return next();
  }
  // MOJ multi-file-upload expects a 200 response when the request is not valid
  // It will only display the error messages when the response is 200.
  return res.status(200).send(
    { error: { message: 'File upload session expired. Please refresh your browser to upload or delete the files.' } },
  );
};

const validateFiles = multer({ fileFilter: multerFilter }).single('documents');

/**
 * Uses multer to upload and validate the files
 * If there are no errors move to the next middleware
 * Otherwise, return an error response
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
const validateUploadRequest = (req, res, next) => {
  validateFiles(req, res, (error) => {
    if (!error) {
      return next();
    }
    // MOJ multi-file-upload expects a 200 response with an error message, rather than an error response.
    // It will only display the error messages when the response is 200.
    return res.status(200).send({ file: error.file, error: { message: error.message } });
  });
};

router.post(
  '/application-details/:dealId/supporting-information/document/:documentType/upload',
  [validateUploadCsrfToken, validateToken, validateBank, validateRole({ role: ['maker'] }), validateUploadRequest],
  uploadSupportingDocument,
);
router.post(
  '/application-details/:dealId/supporting-information/document/:documentType/delete',
  [validateUploadCsrfToken, validateToken, validateBank, validateRole({ role: ['maker'] })],
  deleteSupportingDocument,
);

module.exports = router;
