const express = require('express');
const multer = require('multer');

const { multerFilter } = require('../utils/multer-filter.utils');

const {
  getSupportingDocuments, postSupportingDocuments, uploadSupportingDocument, deleteSupportingDocument,
} = require('../controllers/supporting-information/supporting-documents');

const validateToken = require('../middleware/validateToken');

const router = express.Router();

const upload = multer({ fileFilter: multerFilter }).single('documents');
router.get('/application-details/:dealId/supporting-information/document/:documentType', [validateToken], getSupportingDocuments);
router.post('/application-details/:dealId/supporting-information/document/:documentType', [validateToken, multer().array('documents', 20)], postSupportingDocuments);
router.post('/application-details/:dealId/supporting-information/document/:documentType/upload', [validateToken], (req, res, next) => {
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
router.post('/application-details/:dealId/supporting-information/document/:documentType/delete', [validateToken], deleteSupportingDocument);

module.exports = router;
