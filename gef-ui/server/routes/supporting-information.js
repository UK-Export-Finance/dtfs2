const express = require('express');
const multer = require('multer');
const { multerFilter, formatBytes } = require('../utils/multer-filter.utils');
const {
  getSupportingDocuments,
  postSupportingDocuments,
  uploadSupportingDocument,
  deleteSupportingDocument,
} = require('../controllers/supporting-information/supporting-documents');
const { validateRole, validateToken, validateBank } = require('../middleware');
const { FILE_UPLOAD } = require('../constants/file-upload');

const router = express.Router();

const uploadSingle = multer({ limits: { fileSize: FILE_UPLOAD.MAX_FILE_SIZE }, fileFilter: multerFilter }).single('documents');
const uploadMultiple = multer({ limits: { fileSize: FILE_UPLOAD.MAX_FILE_SIZE } }).array('documents', 20);
router.get(
  '/application-details/:dealId/supporting-information/document/:documentType',
  [validateToken, validateBank, validateRole({ role: ['maker'] })],
  getSupportingDocuments,
);
router.post(
  '/application-details/:dealId/supporting-information/document/:documentType',
  [validateToken, validateBank, uploadMultiple()],
  postSupportingDocuments,
);
router.post(
  '/application-details/:dealId/supporting-information/document/:documentType/upload',
  [validateToken, validateBank, validateRole({ role: ['maker'] })],
  (req, res, next) => {
    uploadSingle(req, res, (error) => {
      if (!error) {
        return next(); // if there are no errors, then continue with the file upload
      }
      // if there are errors, then return a message to the user
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(200).send({ error: { message: `File too large, must be smaller than ${formatBytes(FILE_UPLOAD.MAX_FILE_SIZE)}` } });
      }
      return res.status(200).send({ file: error.file, error: { message: error.message } });
    });
  },
  uploadSupportingDocument,
);
router.post(
  '/application-details/:dealId/supporting-information/document/:documentType/delete',
  [validateToken, validateBank, validateRole({ role: ['maker'] })],
  deleteSupportingDocument,
);

module.exports = router;
