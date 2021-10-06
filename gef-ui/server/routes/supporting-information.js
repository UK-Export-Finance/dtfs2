const express = require('express');
const multer = require('multer');

const {
  getSecurityDetails,
  postSecurityDetails,
  getUploadManualInclusion,
  postUploadManualInclusion,
  uploadManualInclusion,
  deleteManualInclusion,
} = require('../controllers/supporting-information');

const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:applicationId/supporting-information/manual-inclusion-questionnaire', [validateToken], getUploadManualInclusion);
router.post('/application-details/:applicationId/supporting-information/manual-inclusion-questionnaire', [validateToken, multer().array('documents', 20)], postUploadManualInclusion);
router.post('/application-details/:applicationId/supporting-information/manual-inclusion-questionnaire/upload', [validateToken, multer().single('documents')], uploadManualInclusion);
router.post('/application-details/:applicationId/supporting-information/manual-inclusion-questionnaire/delete', [validateToken], deleteManualInclusion);

router.get('/application-details/:applicationId/supporting-information/security-details', [validateToken], getSecurityDetails);
router.post('/application-details/:applicationId/supporting-information/security-details', [validateToken], postSecurityDetails);

module.exports = router;
