const express = require('express');
const { validateRole, validateToken } = require('../middleware');
const downloadFile = require('../controllers/downloadFile');
const { MAKER, CHECKER } = require('../constants/roles');

const router = express.Router();

/**
 * @openapi
 * /file/:fileId:
 *   get:
 *     summary: Handles file download requests
 *     tags: [Portal - Gef]
 *     description: Handles file download requests
 *     parameters:
 *       - in: path
 *         name: fileId
 *         schema:
 *           type: string
 *         required: true
 *         description: the file ID
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.get('/file/:fileId', [validateToken, validateRole({ role: [MAKER, CHECKER] })], (req, res) => downloadFile(req, res));

module.exports = router;
