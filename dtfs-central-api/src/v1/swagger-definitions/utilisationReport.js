/**
 * @openapi
 * definitions:
 *   UtilisationReport:
 *     type: object
 *     properties:
 *       id:
 *         type: string
 *         example: '9'
 *         description: Bank id. Separate MongoDB _id
 *       month:
 *         type: integer
 *         example: 1
 *       year:
 *         type: integer
 *         example: 2021
 *       dateUploaded:
 *         type: string
 *         example: 2021-01-01T00:00:00.000Z
 *       path:
 *         type: string
 *         example: 'document.pdf'
 *       uploadedBy:
 *         type: object
 *         properties:
 *           id:
 *             type: string
 *             example: '9'
 *           name:
 *             type: string
 *             example: 'John Smith'
 *       bank:
 *         type: object
 *         properties:
 *           id:
 *             type: string
 *             example: '9'
 *           name:
 *             type: string
 *             example: 'UKEF test bank (Delegated)'
 */
