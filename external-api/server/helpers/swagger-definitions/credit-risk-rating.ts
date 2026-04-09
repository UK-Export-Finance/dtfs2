/**
 * @openapi
 * definitions:
 *   CreditRiskRating:
 *     type: object
 *     properties:
 *       id:
 *         type: number
 *         example: 1
 *       name:
 *         type: number
 *         example: 1
 *       description:
 *         type: string
 *         example: 'AAA'
 *       createdAt:
 *         type: string
 *         format: date-time
 *         example: '2026-01-14T14:15:00.943Z'
 *       updatedAt:
 *         type: string
 *         format: date-time
 *         example: '2026-01-14T14:15:00.943Z'
 *       effectiveFrom:
 *         type: string
 *         format: date-time
 *         example: '2026-01-14T14:15:00.943Z'
 *       effectiveTo:
 *         type: string
 *         format: date-time
 *         example: '9999-12-31T00:00:00.000Z'
 *   CreditRiskRatings:
 *     type: object
 *     properties:
 *       creditRiskRatings:
 *         type: array
 *         items:
 *           $ref: '#/definitions/CreditRiskRating'
 *       count:
 *         type: integer
 *         example: 1
 */
