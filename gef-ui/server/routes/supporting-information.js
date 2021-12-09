const express = require('express');
const multer = require('multer');

const { getSecurityDetails, postSecurityDetails } = require('../controllers/supporting-information/security-details');
const { multerFilter } = require('../utils/multer-filter.utils');

const {
  getSupportingDocuments, postSupportingDocuments, uploadSupportingDocument, deleteSupportingDocument,
} = require('../controllers/supporting-information/supporting-documents');

const validateToken = require('../middleware/validateToken');

const router = express.Router();

const upload = multer({ fileFilter: multerFilter }).single('documents');

router.get('/application-details/:applicationId/supporting-information/security-details', [validateToken], getSecurityDetails);
router.post('/application-details/:applicationId/supporting-information/security-details', [validateToken], postSecurityDetails);

router.get('/application-details/:applicationId/supporting-information/:documentType', [validateToken], getSupportingDocuments);
router.post('/application-details/:applicationId/supporting-information/:documentType', [validateToken, multer().array('documents', 20)], postSupportingDocuments);
router.post('/application-details/:applicationId/supporting-information/:documentType/upload', [validateToken], (req, res, next) => {
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
router.post('/application-details/:applicationId/supporting-information/:documentType/delete', [validateToken], deleteSupportingDocument);

module.exports = router;
