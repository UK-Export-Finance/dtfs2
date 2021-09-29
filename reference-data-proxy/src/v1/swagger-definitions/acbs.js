/**
 * @openapi
 * definitions:
 *   ACBSCreateRecordRequestBody:
 *     type: object
 *     properties:
 *       deal:
 *         $ref: '#/definitions/DealBSS'
 *       bank:
 *         $ref: '#/definitions/Bank'
 *   ACBSCreateRecordResponseBody:
 *     type: object
 *     properties:
 *       portalDealId:
 *         type: string
 *         example: 123abc
 *       ukefDealId:
 *         type: string
 *         example: '20010739'
 *       deal:
 *         type: object
 *         properties:
 *           parties:
 *             type: object
 *           deal:
 *             type: object
 *           investor:
 *             type: object
 *           guarantee:
 *             type: object
 *       facilities:
 *         type: array
 *   ACBSIssueFacilityRequestBody:
 *     type: object
 *     properties:
 *       facility:
 *         type: object
 *         example: { allFacilityFields: true }
 *       supplierName:
 *         type: string
 *         example: 'The Supplier'
  *   ACBSIssueFacilityResponseBody:
 *     type: object
 *     properties:
 *       facilityId:
 *         type: string
 *         example: abc1234
 *       issuedFacilityMaster:
 *         type: object
 */
