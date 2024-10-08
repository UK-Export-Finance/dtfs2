/**
 * @openapi
 * definitions:
 *   Payment:
 *     type: object
 *     properties:
 *       id:
 *         type: number
 *       currency:
 *         type: '#/definitions/Currency'
 *       amount:
 *         type: number
 *       dateReceived:
 *         type: string
 *         format: date
 *       reference:
 *         type: string
 *         required: false
 */
