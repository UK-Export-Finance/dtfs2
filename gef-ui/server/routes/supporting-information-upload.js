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

// eslint-disable-next-line consistent-return
const validateUploadCsrfToken = (req, res, next) => {
  if (req.session.uploadCsrf
    && req.session.uploadCsrf.token === req.query.uploadCsrf
    && new Date() < new Date(req.session.uploadCsrf.expiry)) {
    next();
  } else {
    // MOJ multi-file-upload expects a 200 response when the request is not valid
    // It will only display the error messages when the response is 200.
    return res.status(200).send({ error: { message: 'Error. Please refresh your browser and try again' } });
  }
};

const validateFiles = multer({ fileFilter: multerFilter }).single('documents');
const validateUploadRequest = (req, res, next) => {
  // eslint-disable-next-line consistent-return
  validateFiles(req, res, (err) => {
    if (!err) {
      next();
    } else {
      return res.status(200).send({ file: err.file, error: { message: err.message } });
    }
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
