/**
 * @openapi
 * definitions:
 *   User:
 *     type: object
 *     properties:
 *       username:
 *         type: string
 *         example: BANK1_MAKER1
 *       roles:
 *         type: array
 *         items:
 *           type: string
 *         example: ['maker']
 *       timezone:
 *         type: string
 *         example: Europe/London
 *       firstname:
 *         type: string
 *         example: Joe
 *       surname:
 *         type: string
 *         example: Bloggs
 *       bank:
 *         $ref: '#/definitions/Bank'
 *       user-status:
 *         type: string
 *         example: active
 *       lastLogin:
 *         type: string
 *         example: '1632233768694'
 *       loginFailureCount:
 *         type: integer
 *         example: 1
 *       sessionIdentifier:
 *         type: string
 *         example: '81312c393'
 */
