const express = require('express');
const multer = require('multer');
const {
  getSupportingDocuments, postSupportingDocuments,
} = require('../controllers/supporting-information/supporting-documents');
const { validateRole, validateToken, validateBank } = require('../middleware');

const router = express.Router();

router.get('/application-details/:dealId/supporting-information/document/:documentType', [validateToken, validateBank, validateRole({ role: ['maker'] })], getSupportingDocuments);
router.post('/application-details/:dealId/supporting-information/document/:documentType', [validateToken, validateBank, multer().array('documents', 20)], postSupportingDocuments);

module.exports = router;
