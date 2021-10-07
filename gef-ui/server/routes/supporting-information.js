const express = require('express');
const multer = require('multer');

const {
  getSecurityDetails,
  postSecurityDetails,
} = require('../controllers/supporting-information/security-details');

const {
  getSupportingDocuments,
  postSupportingDocuments,
  uploadSupportingDocument,
  deleteSupportingDocument,
} = require('../controllers/supporting-information/supporting-documents');

const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:applicationId/supporting-information/security-details', [validateToken], getSecurityDetails);
router.post('/application-details/:applicationId/supporting-information/security-details', [validateToken], postSecurityDetails);

router.get('/application-details/:applicationId/supporting-information/:documentType', [validateToken], getSupportingDocuments);
router.post('/application-details/:applicationId/supporting-information/:documentType', [validateToken, multer().array('documents', 20)], postSupportingDocuments);
router.post('/application-details/:applicationId/supporting-information/:documentType/upload', [validateToken, multer().single('documents')], uploadSupportingDocument);
router.post('/application-details/:applicationId/supporting-information/:documentType/delete', [validateToken], deleteSupportingDocument);

module.exports = router;
