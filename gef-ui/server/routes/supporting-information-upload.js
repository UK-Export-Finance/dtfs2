const express = require('express');
const multer = require('multer');
const { multerFilter, formatBytes } = require('../utils/multer-filter.utils');
const { uploadSupportingDocument, deleteSupportingDocument } = require('../controllers/supporting-information/supporting-documents');
const { validateRole, validateToken, validateBank } = require('../middleware');
const { FILE_UPLOAD } = require('../constants/file-upload');
const { isCsrfTokenValid } = require('../utils/csrf-token-checker');
const { MAKER } = require('../constants/roles');

// The following routes cannot use the same csrf checks as the rest of the routes
// as the Ministry of Justice multi-file-upload component does not allow passing tokens to the request body.
// So we instead make a separate uploadCsrf token and check it here.
const router = express.Router();

/**
 * Checks that the session uploadCsrf token matches the query uploadCsrf token
 * If the token is valid move to the next middleware
 * If it is invalid return an error response
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
const validateUploadCsrfToken = (req, res, next) => {
  if (isCsrfTokenValid(req.query.uploadCsrf, req.session.uploadCsrf)) {
    return next();
  }
  // The MOJ multi-file-upload component expects a 200 response when the request is not valid
  // It will only display the error messages when the response is 200.
  return res.status(200).send({
    error: { message: 'File upload session expired. Please refresh your browser to upload or delete the files.' },
  });
};

const uploadSingle = multer({ limits: { fileSize: FILE_UPLOAD.MAX_FILE_SIZE }, fileFilter: multerFilter }).single('documents');

router.post(
  '/application-details/:dealId/supporting-information/document/:documentType/upload',
  [validateUploadCsrfToken, validateToken, validateBank, validateRole({ role: [MAKER] })],
  (req, res, next) => {
    uploadSingle(req, res, (error) => {
      if (!error) {
        return next(); // if there are no errors, then continue with the file upload
      }
      // If there are errors, then return a message to the user
      // The MOJ multi-file-upload expects a 200 response when the request is not valid
      // It will only display the error messages when the response is 200.
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(200).send({
          error: { message: `File too large, must be smaller than ${formatBytes(FILE_UPLOAD.MAX_FILE_SIZE)}` },
        });
      }
      return res.status(200).send({ file: error.file, error: { message: error.message } });
    });
  },
  uploadSupportingDocument,
);
router.post(
  '/application-details/:dealId/supporting-information/document/:documentType/delete',
  [validateUploadCsrfToken, validateToken, validateBank, validateRole({ role: [MAKER] })],
  deleteSupportingDocument,
);

module.exports = router;
