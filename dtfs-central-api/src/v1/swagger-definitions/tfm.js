/**
 * @openapi
 * definitions:
 *   TFMDealBSS:
 *     type: object
 *     properties:
 *       _id:
 *         type: string
 *         example: 123abc
 *       dealSnapshot:
 *         type: object
 *         properties:
 *           _id:
 *             type: string
 *             example: 123abc
 *           dealType:
 *             type: string
 *             example: BSS/EWCS
 *           status:
 *             type: string
 *             example: Submitted
 *           submissionCount:
 *             type: integer
 *             example: 1
 *       tfm:
 *         type: object
 *         properties:
 *           product:
 *             type: string
 *             example: BSS
 *           dateReceived:
 *             type: string
 *             example: '16-09-2021'
 *           stage:
 *             type: string
 *             example: Confirmed
 *           exporterCreditRating:
 *             type: string
 *             example: Acceptable (B+)
 *   TFMFacilityGEF:
 *     type: object
 *     properties:
 *       _id:
 *         type: string
 *         example: 123abc
 *       facilitySnapshot:
 *         type: object
 *         properties:
 *           _id:
 *             type: string
 *             example: 123abc
 *           dealId:
 *             type: string
 *             example: 456abc
 *           type:
 *             type: string
 *             example: Cash
 *           value:
 *             type: integer
 *             example: 123
 *       tfm:
 *         type: object
 *         properties:
 *           ukefExposure:
 *             type: integer
 *             example: 100
 *   TFMUser:
 *     type: object
 *     properties:
 *       username:
 *         type: string
 *         example: T1_USER_1
 *       email:
 *         type: test@testing.com
 *       teams:
 *         type: array
 *         items:
 *           type: string
 *         example: ['BUSINESS_SUPPORT']
 *       timezone:
 *         type: string
 *         example: Europe/London
 *       firstName:
 *         type: string
 *         example: Joe
 *       lastName:
 *         type: string
 *         example: Bloggs
 *   TFMUsers:
 *     type: array
 *     items:
 *       $ref: '#/definitions/TFMUser'
 *   TFMTeam:
 *     type: object
 *     properties:
 *       id:
 *         type: string
 *         example: BUSINESS_SUPPORT
 *       name:
 *         type: string
 *         example: Business support group
 *       email:
 *         type: team@email.com
 *   TFMTeams:
 *     type: array
 *     items:
 *       $ref: '#/definitions/TFMUser'
 */
