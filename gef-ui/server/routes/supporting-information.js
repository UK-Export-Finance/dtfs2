const express = require('express');
const multer = require('multer');
const { getSupportingDocuments, postSupportingDocuments } = require('../controllers/supporting-information/supporting-documents');
const { validateRole, validateToken, validateBank } = require('../middleware');
const { FILE_UPLOAD } = require('../constants/file-upload');
const { MAKER } = require('../constants/roles');

const router = express.Router();

const uploadMultiple = multer({ limits: { fileSize: FILE_UPLOAD.MAX_FILE_SIZE } }).array('documents', 20);

router.get(
  '/application-details/:dealId/supporting-information/document/:documentType',
  [validateToken, validateBank, validateRole({ role: [MAKER] })],
  getSupportingDocuments,
);
router.post(
  '/application-details/:dealId/supporting-information/document/:documentType',
  [validateToken, validateBank, validateRole({ role: [MAKER] }), uploadMultiple],
  postSupportingDocuments,
);

module.exports = router;
