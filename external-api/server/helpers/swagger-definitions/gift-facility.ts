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
 *     type: object
 *     properties:
 *       facilities:
 *         type: array
 *         description: Array of facility lookup results
 *         items:
 *           $ref: '#/definitions/GiftFacility'
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
 */
