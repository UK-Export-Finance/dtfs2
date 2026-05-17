/**
 * @openapi
 * definitions:
 *   GiftFacility:
 *     type: object
 *     properties:
 *       facilityId:
 *         type: string
 *         description: The GIFT facility ID
 *         example: 'FACILITY-001'
 *       status:
 *         type: integer
 *         description: HTTP status code for the facility lookup
 *         example: 200
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
