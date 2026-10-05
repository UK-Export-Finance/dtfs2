/**
 * @openapi
 * definitions:
 *   GiftFacility:
 *     type: object
 *     description: GIFT facility payload returned by APIM
 *     additionalProperties: true
 *     example:
 *       amount: 10000
 *       creditType: Term
 *       currency: USD
 *       effectiveDate: '2025-01-01'
 *       expiryDate: '2027-02-01'
 *       facilityId: '0030000322'
 *       name: Amazing facility
 *       obligorUrn: '01234567'
 *       productTypeCode: PRT003
 *       repaymentType: Scheduled
 *   GiftFacilitiesBulkResponse:
 *     type: array
 *     description: Array of facility lookup results
 *     items:
 *       $ref: '#/definitions/GiftFacility'
 *   GiftFacilityErrorResponse:
 *     type: object
 *     properties:
 *       status:
 *         type: integer
 *         description: HTTP error status code
 *         example: 400
 *       message:
 *         type: string
 *         description: Error message
 *         example: 'ids query parameter is required'
 *   GiftFacilityAmendmentRequestBody:
 *     oneOf:
 *       - type: object
 *         required:
 *           - amendmentType
 *           - amendmentData
 *         properties:
 *           amendmentType:
 *             type: string
 *             enum: [IncreaseAmount, DecreaseAmount]
 *             description: The APIM/GIFT amendment type for a facility amount change.
 *           amendmentData:
 *             type: object
 *             required:
 *               - amount
 *               - date
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Absolute difference between previous and new amount.
 *                 example: 13800
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Effective date of the amount amendment in YYYY-MM-DD format.
 *                 example: '2026-12-20'
 *       - type: object
 *         required:
 *           - amendmentType
 *           - amendmentData
 *         properties:
 *           amendmentType:
 *             type: string
 *             enum: [ReplaceExpiryDate]
 *             description: The APIM/GIFT amendment type for a cover end date change.
 *           amendmentData:
 *             type: object
 *             required:
 *               - expiryDate
 *             properties:
 *               expiryDate:
 *                 type: string
 *                 format: date
 *                 description: Replacement facility expiry date in YYYY-MM-DD format.
 *                 example: '2026-12-20'
 *     description: |
 *       Supported amendment payload shapes for APIM/GIFT.
 *       The payload is nested under amendmentData and varies by amendmentType.
 *   GiftFacilityMultipleAmendmentsRequestBody:
 *     type: object
 *     required:
 *       - amendments
 *     properties:
 *       amendments:
 *         type: array
 *         description: Array of amendments to apply to a facility
 *         items:
 *           $ref: '#/definitions/GiftFacilityAmendmentRequestBody'
 *         minItems: 1
 *         example:
 *           - amendmentType: IncreaseAmount
 *             amendmentData:
 *               amount: 13800
 *               date: '2026-12-20'
 *           - amendmentType: ReplaceExpiryDate
 *             amendmentData:
 *               expiryDate: '2027-12-20'
 *     description: Request body for submitting multiple facility amendments to APIM/GIFT
 */
