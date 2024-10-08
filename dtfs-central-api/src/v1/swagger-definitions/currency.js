/**
 * @openapi
 * definitions:
 *   Currency:
 *     type: string
 *     enum:
 *       - GBP
 *       - EUR
 *       - USD
 *       - JPY
 *   CurrencyAndAmount:
 *     type: object
 *     properties:
 *       currency:
 *         $ref: '#/definitions/Currency'
 *       amount:
 *         type: number
 */
