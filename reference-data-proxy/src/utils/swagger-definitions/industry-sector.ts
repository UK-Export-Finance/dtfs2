/**
 * @openapi
 * definitions:
 *   IndustrySector:
 *     type: object
 *     properties:
 *       code:
 *         type: string
 *         example: 1008
 *       name:
 *         type: string
 *         example: Accommodation and food service activities
 *       classes:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               example: '55100'
 *             name:
 *               type: string
 *               example: Hotels and similar accomodation
 *   IndustrySectors:
 *     type: object
 *     properties:
 *       industrySectors:
 *         type: array
 *         items:
 *           $ref: '#/definitions/IndustrySector'
 *       count:
 *         type: integer
 *         example: 1
 */
