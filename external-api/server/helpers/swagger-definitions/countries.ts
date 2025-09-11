/**
 * @openapi
 * definitions:
 *   Country:
 *     type: object
 *     properties:
 *       id:
 *         type: integer
 *         example: 826
 *       name:
 *         type: string
 *         example: United Kingdom
 *       code:
 *         type: integer
 *         example: GBR
 *   Countries:
 *     type: object
 *     properties:
 *       countries:
 *         type: array
 *         items:
 *           $ref: '#/definitions/Country'
 *       count:
 *         type: integer
 *         example: 1
 */
