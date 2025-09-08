/**
 * @openapi
 * definitions:
 *   Currency:
 *     type: object
 *     properties:
 *       currencyId:
 *         type: integer
 *         example: 12
 *       text:
 *         type: string
 *         example: GBP - UK Sterling
 *       id:
 *         type: integer
 *         example: GBP
 *   Currencies:
 *     type: object
 *     properties:
 *       currencies:
 *         type: array
 *         items:
 *           $ref: '#/definitions/Currency'
 *       count:
 *         type: integer
 *         example: 1
 */
