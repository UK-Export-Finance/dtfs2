/**
 * @openapi
 * definitions:
 *   PremiumScheduleRequestBody:
 *     type: object
 *     properties:
 *       facilityURN:
 *         type: integer
 *         example: 0040004833
 *       productGroup:
 *         type: string
 *         example: 'BS'
 *       premiumTypeId:
 *         type: integer
 *         example: 1
 *       premiumFrequencyId:
 *         type: integer
 *         example: 2
 *       cumulativeAmount:
 *         type: integer
 *         example: 1234
 *       guaranteeExpiryDate:
 *         type: string
 *         example: '2023-05-01'
 *       guaranteeFeePercentage:
 *         type: integer
 *         example: 10000
 *       guaranteePercentage:
 *         type: integer
 *         example: 80
 *       dayBasis:
 *         type: string
 *         example: '365'
 *       exposurePeriod:
 *         type: integer
 *         example: 12
 *       maximumLiability:
 *         type: integer
 *         example: 5678
 *   PremiumScheduleResponseBody:
 *     type: array
 *     items:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 33
 *         facilityURN:
 *           type: integer
 *           example: 44677
 *         calculationDate:
 *           type: string
 *           example: '2021-01-19'
 *         income:
 *           type: integer
 *           example: 465
 *         incomePerDay:
 *           type: integer
 *           example: 15
 *         exposure:
 *           type: integer
 *           example: 400000
 *         period:
 *           type: integer
 *           example: 1
 *         daysInPeriod:
 *           type: integer
 *           example: 31
 *         effectiveFrom:
 *           type: string
 *           example: '2021-01-19T00:00:00'
 *         effectiveTo:
 *           type: string
 *           example: '2022-05-17T00:00:00'
 *         created:
 *           type: string
 *           example: '2021-01-21T20:09:22'
 *         updated:
 *           type: string
 *           example: '2021-01-21T20:09:22'
 *         isAtive:
 *           type: string
 *           example: Y
 */
