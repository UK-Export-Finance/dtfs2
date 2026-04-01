/**
 * @openapi
 * definitions:
 *   FacilityCategory:
 *     type: object
 *     properties:
 *       type:
 *         type: string
 *         example: 'Facility Category'
 *       typeCode:
 *         type: string
 *         example: 'facilityCategory'
 *       code:
 *         type: string
 *         example: 'FCT007'
 *       description:
 *         type: string
 *         example: 'GEF: Cash Advances'
 *       isActive:
 *         type: boolean
 *         example: true
 *   FacilityCategories:
 *     type: array
 *     items:
 *       $ref: '#/definitions/FacilityCategory'
 */
