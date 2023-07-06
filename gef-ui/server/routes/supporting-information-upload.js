const express = require('express');
const multer = require('multer');
const { multerFilter } = require('../utils/multer-filter.utils');
const {
  uploadSupportingDocument, deleteSupportingDocument,
} = require('../controllers/supporting-information/supporting-documents');
const { validateRole, validateToken, validateBank } = require('../middleware');

// The following routes cannot use the same csrf checks as the rest of the routes
// as the Ministry of Justice multi-file-upload component does not allow passing tokens to the request body.
// So we instead make a separate file-upload-csrf token and check it here.
const router = express.Router();

const upload = multer({ fileFilter: multerFilter }).single('documents');
router.post('/application-details/:dealId/supporting-information/document/:documentType/upload', [validateToken, validateBank, validateRole({ role: ['maker'] })], (req, res, next) => {
  // eslint-disable-next-line consistent-return
  upload(req, res, (err) => {
    if (!err) {
      next(); // if there are no errors, then continue with the file upload
    } else {
      // if there are errors, then return a message to the user
      return res.status(200).send({ file: err.file, error: { message: err.message } });
    }
  });
}, uploadSupportingDocument);
router.post('/application-details/:dealId/supporting-information/document/:documentType/delete', [validateToken, validateBank, validateRole({ role: ['maker'] })], deleteSupportingDocument);

module.exports = router;
