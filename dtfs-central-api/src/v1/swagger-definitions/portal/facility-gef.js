/**
 * @openapi
 * definitions:
 *   FacilityGEF:
 *     type: object
 *     properties:
 *       _id:
 *         type: string
 *         example: 123abc
 *       dealId:
 *         type: string
 *         example: 456abc
 *       type:
 *         type: string
 *         example: Contingent
 *       hasBeenIssued:
 *         type: boolean
 *         example: false
 *       name:
 *         type: string
 *         example: My facility
 *       shouldCoverStartOnSubmission:
 *         type: boolean
 *         example: false
 *       coverStartDate:
 *         type: date
 *         example: 2025-01-01 00:00:00.000Z
 *       coverEndDate:
 *         type: date
 *         example: 2030-01-01 00:00:00.000Z
 *       monthsOfCover:
 *         type: integer
 *         example: 48
 *       details:
 *         type: array
 *         items:
 *           type: string
 *           example: Other
 *       detailsOther:
 *         type: string
 *         example: Test extra information
 *       currency:
 *         type: object
*         example: { id: 'JPY' }
 *       value:
 *         type: integer
 *         example: 300000
 *       coverPercentage:
 *         type: integer
 *         example: 20
 *       interestPercentage:
 *         type: integer
 *         example: 50.9
 *       paymentType:
 *         type: string
 *         example: IN_ARREARS_QUARTLY
 *       createdAt:
 *         type: integer
 *         example: 1632743099128.0
 *       updatedAt:
 *         type: integer
 *         example: 1632743099128.0
 *       ukefExposure:
 *         type: integer
 *         example: 600000000
 *       submittedAsIssuedDate:
 *         type: string
 *         example: '1628770126495'
 *       ukefFacilityId:
 *         type: string
 *         example: '0030034426'
 *       feeType:
 *         type: string
 *         example: in advacnce
 *       frequency:
 *         type: string
 *         example: Monthly
 *       dayCountBasis:
 *         type: string
 *         example: '365'
 *   FacilitiesGEF:
 *     type: array
 *     items:
 *       $ref: '#/definitions/FacilityGEF'
 */
