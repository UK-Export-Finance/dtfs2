const express = require('express');
const multer = require('multer');
const { getSupportingDocuments, postSupportingDocuments } = require('../controllers/supporting-information/supporting-documents');
const { validateRole, validateToken, validateBank } = require('../middleware');
const { FILE_UPLOAD } = require('../constants/file-upload');
const { MAKER } = require('../constants/roles');

const router = express.Router();

const uploadMultiple = multer({ limits: { fileSize: FILE_UPLOAD.MAX_FILE_SIZE } }).array('documents', 20);

/**
 * @openapi
 * /application-details/:dealId/supporting-information/document/:documentType:
 *   get:
 *     summary: Get the submit to ukef page for a given deal.
 *     tags: [Portal - Gef]
 *     description: Get the submit to ukef page for a given deal.
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
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post request for uploading, validating, and deleting supporting documents for a specific application.
 *     tags: [Portal - Gef]
 *     description: Post request for uploading, validating, and deleting supporting documents for a specific application.
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
 *               submit:
 *                 type: string
 *           example:
 *             delete: 'mock-file.pdf'
 *             submit: 'true'
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
router
  .route('/application-details/:dealId/supporting-information/document/:documentType')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(getSupportingDocuments)
  .post(uploadMultiple, postSupportingDocuments);

module.exports = router;
