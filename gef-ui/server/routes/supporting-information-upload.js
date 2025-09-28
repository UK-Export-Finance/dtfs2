const express = require('express');
const multer = require('multer');
const { multerFilter, formatBytes } = require('../utils/multer-filter.utils');
const { uploadSupportingDocument, deleteSupportingDocument } = require('../controllers/supporting-information/supporting-documents');
const { validateRole, validateToken, validateBank } = require('../middleware');
const { FILE_UPLOAD } = require('../constants/file-upload');
const { MAKER } = require('../constants/roles');

// The following routes cannot use the same csrf checks as the rest of the routes
// as the Ministry of Justice multi-file-upload component does not allow passing tokens to the request body.
// So we instead make a separate uploadCsrf token and check it here.
const router = express.Router();

const uploadSingle = multer({ limits: { fileSize: FILE_UPLOAD.MAX_FILE_SIZE }, fileFilter: multerFilter }).single('documents');

/**
 * @openapi
 * /application-details/:dealId/supporting-information/document/:documentType/upload:
 *   post:
 *     summary: Handles the upload of a supporting document for a specific deal and document type.
 *     tags: [Portal - Gef]
 *     description: Handles the upload of a supporting document for a specific deal and document type.
 *     parameters:
 *       - in: path
 *         name: dealId, documentType
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID and documentType
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post(
  '/application-details/:dealId/supporting-information/document/:documentType/upload',
  [validateToken, validateBank, validateRole({ role: [MAKER] })],
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

/**
 * @openapi
 * /application-details/:dealId/supporting-information/document/:documentType/upload:
 *   delete:
 *     summary: Deletes a supporting document from a deal.
 *     tags: [Portal - Gef]
 *     description: Deletes a supporting document from a deal.
 *     parameters:
 *       - in: path
 *         name: dealId, documentType
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID and documentType
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               delete:
 *                 type: string
 *           example:
 *             delete: 'mock-file.pdf'
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post(
  '/application-details/:dealId/supporting-information/document/:documentType/delete',
  [validateToken, validateBank, validateRole({ role: [MAKER] })],
  deleteSupportingDocument,
);

module.exports = router;
